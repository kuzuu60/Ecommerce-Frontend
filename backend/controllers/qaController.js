const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env'), override: true });
const { getProducts } = require('../utils/dataHandler');
const fs = require('fs');
const { GoogleAuth } = require('google-auth-library');

const GOOGLE_PROJECT_ID = process.env.GOOGLE_PROJECT_ID?.trim();
const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;
const GOOGLE_APPLICATION_CREDENTIALS = process.env.GOOGLE_APPLICATION_CREDENTIALS?.trim();
const AI_PROVIDER = process.env.AI_PROVIDER?.trim().toLowerCase() || 'chatgpt';
const AI_MODEL = process.env.AI_MODEL || 'gemini-1.5-mini';
const AI_LOCATION = process.env.AI_LOCATION || 'us-central1';
const HUGGINGFACE_API_KEY = process.env.HUGGINGFACE_API_KEY;
const HUGGINGFACE_MODEL = process.env.HUGGINGFACE_MODEL || 'Qwen/Qwen2.5-7B-Instruct';
const HUGGINGFACE_API_HOST = process.env.HUGGINGFACE_API_HOST || 'router.huggingface.co/v1';
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_MODEL = process.env.OPENAI_MODEL || 'gpt-3.5-turbo';

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

const callHuggingFace = async (prompt) => {
  if (!HUGGINGFACE_API_KEY) {
    throw new Error('Missing HUGGINGFACE_API_KEY in environment');
  }

  const isV1 = HUGGINGFACE_API_HOST.includes('/v1');
  let endpoint;
  let requestBody;

  if (isV1) {
    endpoint = `https://${HUGGINGFACE_API_HOST}/chat/completions`;
    requestBody = JSON.stringify({
      model: HUGGINGFACE_MODEL,
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.2,
      max_tokens: 256
    });
  } else {
    const encodedModelPath = HUGGINGFACE_MODEL.split('/').map(encodeURIComponent).join('/');
    endpoint = `https://${HUGGINGFACE_API_HOST}/models/${encodedModelPath}`;
    requestBody = JSON.stringify({
      inputs: prompt,
      parameters: {
        max_new_tokens: 256,
        temperature: 0.2,
        top_p: 0.95,
        repetition_penalty: 1.05
      }
    });
  }

  console.debug('HuggingFace request', {
    endpoint,
    model: HUGGINGFACE_MODEL,
    provider: HUGGINGFACE_API_HOST,
    headers: {
      Authorization: `Bearer ${HUGGINGFACE_API_KEY?.slice(0, 8)}...`,
      'Content-Type': 'application/json'
    },
    bodyPreview: requestBody.slice(0, 400)
  });

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${HUGGINGFACE_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: requestBody
  });

  const responseText = await response.text();
  console.debug('HuggingFace raw response', {
    endpoint,
    status: response.status,
    statusText: response.statusText,
    contentType: response.headers.get('content-type'),
    textPreview: responseText.slice(0, 500)
  });

  let data;
  const contentType = response.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    try {
      data = JSON.parse(responseText);
    } catch (parseErr) {
      console.error('Hugging Face invalid JSON response', { endpoint, responseText: responseText.slice(0, 500), parseErr: parseErr.message });
      throw new Error(`Hugging Face returned invalid JSON (status ${response.status} ${response.statusText}): ${responseText.slice(0, 200)}`);
    }
  }

  if (!response.ok) {
    const errorText = data?.error?.message || data?.error || data?.detail || responseText.slice(0, 400);
    throw new Error(`Hugging Face request failed: ${response.status} ${response.statusText} - ${errorText}`);
  }

  if (!data) {
    console.error('Hugging Face response was not JSON', { endpoint, responseText: responseText.slice(0, 500) });
    throw new Error(`Hugging Face returned non-JSON response: ${responseText.slice(0, 200)}`);
  }

  console.debug('HuggingFace response', { status: response.status, statusText: response.statusText, body: data });

  let output = '';
  if (isV1) {
    if (data?.choices?.[0]?.message?.content) {
      output = data.choices[0].message.content;
    }
  } else {
    if (Array.isArray(data) && data[0]?.generated_text) {
      output = data[0].generated_text;
    } else if (typeof data.generated_text === 'string') {
      output = data.generated_text;
    } else if (typeof data?.[0]?.generated_text === 'string') {
      output = data[0].generated_text;
    } else if (typeof data?.generated_text === 'string') {
      output = data.generated_text;
    }
  }

  if (!output) {
    throw new Error(`No response returned from Hugging Face: ${JSON.stringify(data).slice(0,200)}`);
  }

  return output;
};

const callChatGPT = async (prompt) => {
  if (!OPENAI_API_KEY) {
    throw new Error('Missing OPENAI_API_KEY in environment');
  }

  const endpoint = 'https://api.openai.com/v1/chat/completions';
  const requestBody = JSON.stringify({
    model: OPENAI_MODEL,
    messages: [
      {
        role: 'system',
        content: 'You are an expert product assistant. Answer the user question using only the product information provided in the prompt.'
      },
      {
        role: 'user',
        content: prompt
      }
    ],
    temperature: 0.2,
    max_tokens: 300,
    top_p: 0.95
  });

  console.debug('ChatGPT request', {
    endpoint,
    model: OPENAI_MODEL,
    bodyPreview: requestBody.slice(0, 400)
  });

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${OPENAI_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: requestBody
  });

  const responseText = await response.text();
  console.debug('ChatGPT raw response', {
    endpoint,
    status: response.status,
    statusText: response.statusText,
    contentType: response.headers.get('content-type'),
    textPreview: responseText.slice(0, 500)
  });

  let data;
  try {
    data = JSON.parse(responseText);
  } catch (err) {
    throw new Error(`ChatGPT returned invalid JSON: ${responseText.slice(0,200)}`);
  }

  if (!response.ok) {
    const errorText = data.error?.message || JSON.stringify(data);
    throw new Error(`ChatGPT request failed: ${response.status} ${response.statusText} - ${errorText}`);
  }

  const answer = data.choices?.[0]?.message?.content || data.choices?.[0]?.text;
  if (!answer) {
    throw new Error(`No response returned from ChatGPT: ${JSON.stringify(data).slice(0,200)}`);
  }

  return answer;
};

const callAI = async (prompt) => {
  const provider = AI_PROVIDER;
  const isAuto = provider === 'auto';
  const tryGemini = provider === 'gemini' || isAuto;
  const tryHuggingFace = provider === 'huggingface' || isAuto;
  let geminiError;

  if (tryGemini) {
    try {
      const answer = await callGemini(prompt);
      return { provider: 'Gemini', answer };
    } catch (err) {
      geminiError = err;
      if (!tryHuggingFace) {
        throw err;
      }
    }
  }

  const tryChatGPT = provider === 'chatgpt' || provider === 'openai' || isAuto;
  let chatGPTError;

  if (tryChatGPT) {
    try {
      const answer = await callChatGPT(prompt);
      return { provider: 'ChatGPT', answer };
    } catch (err) {
      chatGPTError = err;
      if (!tryHuggingFace) {
        throw err;
      }
    }
  }

  if (tryHuggingFace) {
    try {
      const answer = await callHuggingFace(prompt);
      return { provider: 'Hugging Face', answer };
    } catch (err) {
      const combinedMessage = chatGPTError ? `ChatGPT failed: ${chatGPTError.message}. Hugging Face failed: ${err.message}` : err.message;
      throw new Error(combinedMessage);
    }
  }

  throw new Error('No AI provider configured. Set AI_PROVIDER=gemini|huggingface|auto and provide the required credentials.');
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
    const { provider, answer } = await callAI(prompt);

    res.json({ answer: answer.trim(), provider });
  } catch (err) {
    console.error('AI QA error:', err);
    res.status(500).json({ message: err.message || 'AI request failed' });
  }
};
