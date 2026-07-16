const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env'), override: true });
const pool = require('../models/db');

const HUGGINGFACE_API_KEY = process.env.HUGGINGFACE_API_KEY;
const HUGGINGFACE_MODEL = process.env.HUGGINGFACE_MODEL || 'Qwen/Qwen2.5-7B-Instruct';
const HUGGINGFACE_API_HOST = process.env.HUGGINGFACE_API_HOST || 'router.huggingface.co/v1';

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
      max_tokens: 1000
    });
  } else {
    const encodedModelPath = HUGGINGFACE_MODEL.split('/').map(encodeURIComponent).join('/');
    endpoint = `https://${HUGGINGFACE_API_HOST}/models/${encodedModelPath}`;
    requestBody = JSON.stringify({
      inputs: prompt,
      parameters: {
        max_new_tokens: 1000,
        temperature: 0.2,
        top_p: 0.95,
        repetition_penalty: 1.05
      }
    });
  }

  const maxAttempts = 3;
  let lastError;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      console.debug(`HuggingFace request (attempt ${attempt}/${maxAttempts})`, {
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
    } catch (err) {
      console.warn(`HuggingFace attempt ${attempt} failed:`, err.message || err);
      lastError = err;
      if (attempt < maxAttempts) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }
  }

  throw lastError;
};


const callAI = async (prompt) => {
  try {
    const answer = await callHuggingFace(prompt);
    return { provider: 'Hugging Face', answer };
  } catch (err) {
    throw new Error(`Hugging Face failed: ${err.message}`);
  }
};

exports.answerQuestion = async (req, res) => {
  try {
    const { productId, question } = req.body;

    if (!productId || !question || !question.trim()) {
      return res.status(400).json({ message: 'productId and question are required' });
    }

    const id = parseInt(productId, 10);
    const result = await pool.query('SELECT * FROM products WHERE id = $1', [id]);

    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const product = result.rows[0];
    const productInfo = {
      title: product.title,
      category: product.category,
      description: product.description,
      price: Number(product.price),
      discountPercentage: Number(product.discount_percentage),
      stock: product.stock,
      availabilityStatus: product.availability_status,
      brand: product.brand,
      shippingInformation: product.shipping_information
    };

    const prompt = buildPrompt(productInfo, question.trim());
    const { provider, answer } = await callAI(prompt);

    res.json({ answer: answer.trim(), provider });
  } catch (err) {
    console.error('AI QA error:', err);
    res.status(500).json({ message: err.message || 'AI request failed' });
  }
};

const getRelevantCategories = (requirements) => {
  const req = requirements.toLowerCase();
  const categories = [];

  if (req.includes('laptop') || req.includes('computer') || req.includes('macbook') || req.includes('zenbook') || req.includes('pc') || req.includes('coding') || req.includes('gaming') || req.includes('programmer')) {
    categories.push('laptops');
  }
  if (req.includes('phone') || req.includes('mobile') || req.includes('smartphone') || req.includes('iphone') || req.includes('android')) {
    categories.push('smartphones', 'mobile-accessories');
  }
  if (req.includes('tablet') || req.includes('ipad') || req.includes('tab')) {
    categories.push('tablets');
  }
  if (req.includes('accessory') || req.includes('accessories') || req.includes('charger') || req.includes('case') || req.includes('cover')) {
    categories.push('mobile-accessories', 'kitchen-accessories', 'sports-accessories');
  }
  if (req.includes('furniture') || req.includes('sofa') || req.includes('bed') || req.includes('chair') || req.includes('table') || req.includes('desk') || req.includes('couch')) {
    categories.push('furniture');
  }
  if (req.includes('decor') || req.includes('decoration') || req.includes('home') || req.includes('living') || req.includes('bedroom') || req.includes('room') || req.includes('wall') || req.includes('lamp') || req.includes('light')) {
    categories.push('home-decoration', 'furniture');
  }
  if (req.includes('kitchen') || req.includes('cook') || req.includes('food') || req.includes('cup') || req.includes('plate') || req.includes('knife') || req.includes('pan') || req.includes('pot')) {
    categories.push('kitchen-accessories');
  }
  if (req.includes('sport') || req.includes('sports') || req.includes('fitness') || req.includes('gym') || req.includes('game') || req.includes('play') || req.includes('outdoor') || req.includes('active') || req.includes('exercise')) {
    categories.push('sports-accessories');
  }
  if (req.includes('glass') || req.includes('glasses') || req.includes('sunglasses') || req.includes('spectacles') || req.includes('shade') || req.includes('shades') || req.includes('sun')) {
    categories.push('sunglasses');
  }

  return [...new Set(categories)];
};

exports.recommendProducts = async (req, res) => {
  try {
    const { requirements } = req.body;

    if (!requirements || !requirements.trim()) {
      return res.status(400).json({ message: 'requirements is required' });
    }

    const relevantCategories = getRelevantCategories(requirements);
    let queryText = 'SELECT * FROM products';
    let queryParams = [];

    if (relevantCategories.length > 0) {
      queryText = 'SELECT * FROM products WHERE category = ANY($1)';
      queryParams = [relevantCategories];
    }

    let result = await pool.query(queryText, queryParams);
    if (result.rowCount === 0 && relevantCategories.length > 0) {
      result = await pool.query('SELECT * FROM products');
    }

    const productsList = result.rows.map(p => ({
      id: p.id,
      title: p.title,
      category: p.category,
      price: Number(p.price),
      description: p.description?.slice(0, 120) + '...',
      brand: p.brand
    }));

    const prompt = `You are an expert product assistant. Below is our complete catalog of products:
${JSON.stringify(productsList, null, 2)}

User Requirements: "${requirements.trim()}"

Based on the user's requirements, recommend the top 1 to 4 products from the catalog above. Provide a friendly conversational response explaining why they are recommended. Keep your explanation concise and under 150 words.
At the very end of your response, output the exact product IDs of the recommended products in this format: [RECOMMENDED_IDS: id1, id2, ...].
For example: "[RECOMMENDED_IDS: 4, 12]". If no products match, do not output this tag.`;

    const { provider, answer } = await callAI(prompt);

    // Extract recommended IDs using regex
    let recommendedIds = [];
    let cleanAnswer = answer;
    const tagMatch = answer.match(/\[RECOMMENDED_IDS:\s*([\d\s,]+)\]/);
    if (tagMatch) {
      recommendedIds = tagMatch[1].split(',').map(id => parseInt(id.trim(), 10)).filter(Boolean);
      cleanAnswer = answer.replace(/\[RECOMMENDED_IDS:\s*[\d\s,]+\]/, '').trim();
    }

    // Find the corresponding products in the database
    let recommendedProducts = [];
    if (recommendedIds.length > 0) {
      const productsRes = await pool.query('SELECT * FROM products WHERE id = ANY($1)', [recommendedIds]);
      
      const productMap = {};
      productsRes.rows.forEach(p => {
        productMap[p.id] = p;
      });

      recommendedProducts = recommendedIds
        .map(id => productMap[id])
        .filter(Boolean)
        .map(p => ({
          id: p.id,
          title: p.title,
          description: p.description,
          category: p.category,
          price: Number(p.price),
          discountPercentage: Number(p.discount_percentage),
          rating: Number(p.rating),
          stock: p.stock,
          brand: p.brand,
          sku: p.sku,
          weight: Number(p.weight),
          warrantyInformation: p.warranty_information,
          shippingInformation: p.shipping_information,
          availabilityStatus: p.availability_status,
          thumbnail: p.thumbnail,
          images: p.images,
          reviews: p.reviews,
          dimensions: p.dimensions
        }));
    }

    res.json({
      answer: cleanAnswer,
      recommendedProducts,
      provider
    });
  } catch (err) {
    console.error('AI Product Recommendation error:', err);
    res.status(500).json({ message: err.message || 'AI request failed' });
  }
};
