const { getProducts } = require('../utils/dataHandler');
const fs = require('fs');
const path = require('path');
const { GoogleAuth } = require('google-auth-library');

const GOOGLE_PROJECT_ID = process.env.GOOGLE_PROJECT_ID?.trim();
const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;
const GOOGLE_APPLICATION_CREDENTIALS = process.env.GOOGLE_APPLICATION_CREDENTIALS?.trim();
const AI_MODEL = process.env.AI_MODEL || 'gemini-1.5-mini';
const AI_LOCATION = process.env.AI_LOCATION || 'us-central1';

const buildPrompt = (product, question) => {
  return `You are an expert product assistant. Answer the user question using only the following product information. If the question is outside this product's details, say that you only know about this product.

Product Title: ${product.title}
Category: ${product.category}
Description: ${product.description || 'No description available.'}
Price: Rs. ${product.price}
Discount: ${product.discountPercentage || 0}%
Stock: ${product.stock}
Availability: ${product.availabilityStatus || 'Unknown'}
Brand: ${product.brand || 'N/A'}
Shipping: ${product.shippingInformation || 'Not specified'}

Question: ${question}

Answer concisely and clearly.`;
};

const callGemini = async (prompt) => {
  const useVertexAI = Boolean(GOOGLE_PROJECT_ID);
  const useServiceAccount = Boolean(GOOGLE_APPLICATION_CREDENTIALS);

  let endpoint;
  let requestBody;
  const headers = { 'Content-Type': 'application/json' };

  if (useVertexAI) {
    endpoint = `https://${AI_LOCATION}-aiplatform.googleapis.com/v1/projects/${GOOGLE_PROJECT_ID}/locations/${AI_LOCATION}/publishers/google/models/${AI_MODEL}:predict`;
    requestBody = {
      instances: [{ content: prompt }],
      parameters: {
        temperature: 0.2,
        maxOutputTokens: 300,
        topP: 0.95,
        topK: 40
      }
    };
  } else {
    if (!GOOGLE_API_KEY) {
      throw new Error('Missing GOOGLE_API_KEY in environment');
    }
    endpoint = `https://generativelanguage.googleapis.com/v1beta2/models/${AI_MODEL}:generateText?key=${GOOGLE_API_KEY}`;
    requestBody = {
      prompt: { text: prompt },
      temperature: 0.2,
      maxOutputTokens: 300
    };
  }

  if (useServiceAccount) {
    if (!fs.existsSync(path.resolve(GOOGLE_APPLICATION_CREDENTIALS))) {
      throw new Error(`Service account file not found: ${GOOGLE_APPLICATION_CREDENTIALS}`);
    }

    process.env.GOOGLE_APPLICATION_CREDENTIALS = path.resolve(GOOGLE_APPLICATION_CREDENTIALS);
    const auth = new GoogleAuth({ scopes: ['https://www.googleapis.com/auth/cloud-platform'] });
    const client = await auth.getClient();
    const token = await client.getAccessToken();
    if (!token || !token.token) {
      throw new Error('Failed to obtain access token from service account');
    }
    headers.Authorization = `Bearer ${token.token}`;
  } else if (!useVertexAI) {
    headers.Authorization = `Bearer ${GOOGLE_API_KEY}`;
  }

  const response = await fetch(endpoint, {
    method: 'POST',
    headers,
    body: JSON.stringify(requestBody)
  });

  const text = await response.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch (err) {
    throw new Error(`Gemini request failed: invalid JSON response: ${text.slice(0,200)}`);
  }

  if (!response.ok) {
    const errorText = data.error?.message || JSON.stringify(data);
    throw new Error(`Gemini request failed: ${errorText}`);
  }

  if (useVertexAI) {
    const prediction = data.predictions?.[0];
    const output = prediction?.content || prediction?.candidates?.[0]?.content;
    if (!output) {
      throw new Error('No response returned from Gemini');
    }
    return output;
  }

  const candidate = data.candidates?.[0];
  const output = candidate?.output || candidate?.content || data.output?.[0]?.content;
  if (!output) {
    throw new Error('No response returned from Gemini');
  }

  return output;
};

exports.answerQuestion = async (req, res) => {
  try {
    const { productId, question } = req.body;

    if (!productId || !question || !question.trim()) {
      return res.status(400).json({ message: 'productId and question are required' });
    }

    const data = getProducts();
    const product = data.products.find((p) => p.id === parseInt(productId, 10));

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const prompt = buildPrompt(product, question.trim());
    const answer = await callGemini(prompt);

    res.json({ answer: answer.trim() });
  } catch (err) {
    console.error('AI QA error:', err);
    res.status(500).json({ message: err.message || 'AI request failed' });
  }
};
