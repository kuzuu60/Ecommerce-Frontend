'use strict';

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env'), override: true });
const pool = require('../models/db');
const { recommendProducts, parseBudget } = require('../utils/contentBasedRecommender');
const { chat, isOllamaRunning, MODEL } = require('../utils/ollamaService');

// ─── helpers ────────────────────────────────────────────────────────────────

const toProductResponse = (product, recommendation = null) => ({
  id: product.id,
  title: product.title,
  description: product.description,
  specs: product.specs || '',
  category: product.category,
  price: Number(product.price),
  discountPercentage: Number(product.discount_percentage),
  stock: product.stock,
  sku: product.sku,
  weight: Number(product.weight),
  warrantyInformation: product.warranty_information,
  shippingInformation: product.shipping_information,
  availabilityStatus: product.availability_status,
  thumbnail: product.thumbnail,
  images: product.images,
  dimensions: product.dimensions,
  similarityScore: recommendation ? Number(recommendation.score.toFixed(3)) : undefined,
  matchReason: recommendation ? recommendation.reason : undefined,
});

// ─── fallback rule-based answer (original logic kept as safety net) ──────────

const answerProductQuestionFallback = (product, question) => {
  const normalizedQuestion = String(question || '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
  const hasAny = (...patterns) => patterns.some((pattern) => pattern.test(normalizedQuestion));
  const originalPrice = Number(product.price) || 0;
  const discountPercentage = Number(product.discount_percentage) || 0;
  const discountedPrice = originalPrice * (1 - discountPercentage / 100);
  const price = originalPrice.toLocaleString('en-IN');
  const specs = product.specs || 'No additional specifications are listed.';

  if (hasAny(/\b(price|cost|how much|expensive|cheap|rate|worth)\b/)) {
    if (discountPercentage > 0) {
      return `${product.title} costs Rs. ${price}. After the ${discountPercentage}% discount, the price is Rs. ${discountedPrice.toLocaleString('en-IN', { maximumFractionDigits: 2 })}.`;
    }
    return `${product.title} is currently priced at Rs. ${price}.`;
  }
  if (hasAny(/\b(stock|available|availability|inventory|quantity|left|units?)\b/, /how many/)) {
    return `${product.title} is ${product.availability_status || 'currently listed'} with ${product.stock ?? 0} item(s) in stock.`;
  }
  if (hasAny(/\b(ship|shipping|delivery|deliver|arrive|receive)\b/)) {
    return `${product.shipping_information || 'Shipping information is not listed for this product.'}`;
  }
  if (hasAny(/\b(warranty|guarantee|covered|replacement)\b/)) {
    return `${product.title} has ${product.warranty_information || 'no warranty information listed'}.`;
  }
  if (hasAny(/\b(brand|manufacturer|maker|made by)\b/)) {
    return `${product.title} is manufactured by ${product.brand || 'a brand not specified in the catalog'}.`;
  }
  if (hasAny(/\b(category|type|kind|department)\b/)) {
    return `${product.title} belongs to the ${product.category || 'uncategorized'} category.`;
  }
  if (hasAny(/\b(sku|code|product id|product number)\b/)) {
    return `${product.title}'s product code is ${product.sku || 'not listed in the catalog'}.`;
  }
  if (hasAny(/\b(weight|heavy|light)\b/)) {
    return `${product.title} weighs ${product.weight ? `${product.weight} unit(s)` : 'an unspecified amount'}.`;
  }
  if (hasAny(/\b(dimension|dimensions|measurement|measurements|length|width|height|size)\b/)) {
    const dimensions = product.dimensions
      ? typeof product.dimensions === 'string' ? product.dimensions : JSON.stringify(product.dimensions)
      : 'not listed in the catalog';
    return `${product.title} dimensions are ${dimensions}.`;
  }
  if (hasAny(/\b(discount|offer|sale|deal|original price|reduced)\b/)) {
    return discountPercentage > 0
      ? `${product.title} has a ${discountPercentage}% discount. The discounted price is Rs. ${discountedPrice.toLocaleString('en-IN', { maximumFractionDigits: 2 })}.`
      : `${product.title} currently has no discount listed.`;
  }
  if (hasAny(/\b(spec|specification|specifications|feature|features|ram|storage|processor|chip|camera|display|screen|material|capacity|compatible|compatibility|use|uses)\b/)) {
    return `${product.title} features: ${specs}. ${product.description || ''}`.trim();
  }
  if (hasAny(/\b(about|describe|description|details|overview|tell me|what is)\b/)) {
    return `${product.title} is a product in the ${product.category || 'uncategorized'} category. ${product.description || 'No description is listed.'}`;
  }
  return `I can answer questions about ${product.title}'s price, stock, shipping, warranty, brand, category, specifications, discount, weight, dimensions, and product code.`;
};

// ─── LLM helpers ────────────────────────────────────────────────────────────

/**
 * Build a compact product data block to inject into the system prompt.
 * We keep it tight to stay within the 1.5B model's effective context.
 */
const buildProductContext = (product) => {
  const originalPrice = Number(product.price) || 0;
  const discountPct   = Number(product.discount_percentage) || 0;
  const discountedPrice = discountPct > 0
    ? (originalPrice * (1 - discountPct / 100)).toFixed(2)
    : null;

  const lines = [
    `Title: ${product.title}`,
    `Category: ${product.category || 'N/A'}`,
    `Brand: ${product.brand || 'N/A'}`,
    `Price: Rs. ${originalPrice.toLocaleString('en-IN')}`,
    discountPct > 0 ? `Discount: ${discountPct}% off → Rs. ${Number(discountedPrice).toLocaleString('en-IN')}` : null,
    `Stock: ${product.stock ?? 0} unit(s) — ${product.availability_status || 'Status unknown'}`,
    `SKU: ${product.sku || 'N/A'}`,
    `Weight: ${product.weight ? `${product.weight} kg` : 'N/A'}`,
    product.dimensions ? `Dimensions: ${typeof product.dimensions === 'string' ? product.dimensions : JSON.stringify(product.dimensions)}` : null,
    `Warranty: ${product.warranty_information || 'None listed'}`,
    `Shipping: ${product.shipping_information || 'None listed'}`,
    product.specs ? `Specifications: ${product.specs}` : null,
    product.description ? `Description: ${product.description}` : null,
  ].filter(Boolean);

  return lines.join('\n');
};

/**
 * Build a compact catalog summary for the recommendation prompt.
 * Caps each entry so the full catalog fits in ~2 k tokens.
 */
const buildCatalogContext = (products) => {
  return products
    .slice(0, 80)  // avoid overflowing the 4 k context of 1.5B models
    .map((p) => {
      const price    = Number(p.price) || 0;
      const discount = Number(p.discount_percentage) || 0;
      const effPrice = discount > 0 ? price * (1 - discount / 100) : price;
      const descSnip = (p.description || '').slice(0, 80);
      const specsSnip = (p.specs || '').slice(0, 60);
      return `- [${p.id}] ${p.title} | ${p.category} | Rs. ${effPrice.toLocaleString('en-IN')}${discount > 0 ? ` (${discount}% off)` : ''} | stock:${p.stock ?? 0} | ${descSnip}${specsSnip ? ' | ' + specsSnip : ''}`;
    })
    .join('\n');
};

// ─── answerQuestion ─────────────────────────────────────────────────────────

exports.answerQuestion = async (req, res) => {
  try {
    const { productId, question } = req.body;

    if (!productId || !question || !question.trim()) {
      return res.status(400).json({ message: 'productId and question are required' });
    }

    const result = await pool.query('SELECT * FROM products WHERE id = $1', [parseInt(productId, 10)]);
    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const product = result.rows[0];

    // Try LLM first
    let answer = null;
    let provider = 'Product Catalog';
    let ollamaOk = false;

    try {
      ollamaOk = await isOllamaRunning();
    } catch { /* ignore */ }

    if (ollamaOk) {
      try {
        const systemPrompt = `You are Luxe, a friendly and knowledgeable human-like shopping assistant for Luxe Commerce — a premium Nepali e-commerce store.
You have detailed knowledge about the product listed below and can answer any questions about it.
You can also help with general shopping advice, comparisons, or casual conversation.
Be warm, concise, and natural. Keep answers to 2–4 sentences unless more detail is needed.
Always mention prices in Rupees (Rs.) when discussing this product.
If the user asks something unrelated to the product, answer helpfully from your general knowledge.
NEVER use robotic phrases like "I'm sorry, but I can't assist with that request" or "As an AI". Speak completely naturally like a human.

PRODUCT CONTEXT (for reference):
${buildProductContext(product)}`;

        answer   = await chat({ systemPrompt, userMessage: question.trim() });
        provider = `Qwen ${MODEL.split(':')[1] || '1.5B'} (local)`;
      } catch (llmErr) {
        console.error('[Ollama] answerQuestion LLM error:', llmErr.message);
        // fall through to rule-based fallback
      }
    }

    // Fallback if LLM unavailable or errored
    if (!answer) {
      answer   = answerProductQuestionFallback(product, question.trim());
      provider = 'Product Catalog';
    }

    res.json({ answer, provider });
  } catch (error) {
    console.error('Product question error:', error);
    res.status(500).json({ message: error.message || 'Product question failed' });
  }
};

// ─── recommendation helpers (kept from original) ────────────────────────────

const buildRecommendationReason = (entry, budget) => {
  const reasons = [];
  if (entry.matches.length > 0) reasons.push(`matches ${entry.matches.slice(0, 3).join(', ')}`);
  if (entry.product.category) reasons.push(`category: ${entry.product.category}`);
  if (budget !== null && entry.inBudget) reasons.push('within your budget');
  return reasons.join('; ') || 'closest match in the catalog';
};

const getConversationRequirements = (requirements, conversation = []) => {
  const previousRequests = Array.isArray(conversation)
    ? conversation
      .filter((message) => message && message.sender === 'user' && typeof message.text === 'string')
      .map((message) => message.text.trim())
      .filter(Boolean)
      .slice(-3)
    : [];
  const currentRequest = requirements.trim();
  const context = previousRequests.filter((request) => request !== currentRequest);
  // Return both: searchQuery (current message only) for TF-IDF,
  // and llmContext (full history) for the Qwen prompt.
  return {
    searchQuery: currentRequest,
    llmContext: [...context, currentRequest].join(' '),
  };
};

// ─── recommendProducts ──────────────────────────────────────────────────────

exports.recommendProducts = async (req, res) => {
  try {
    const { requirements, conversation } = req.body;
    if (!requirements || !requirements.trim()) {
      return res.status(400).json({ message: 'requirements is required' });
    }

    const { searchQuery, llmContext } = getConversationRequirements(requirements, conversation);

    // Always run the content-based recommender to get product cards.
    // Use searchQuery (current message only) so past messages don't pollute the TF-IDF scores.
    const allProducts = await pool.query('SELECT * FROM products');
    const ranked       = recommendProducts(allProducts.rows, searchQuery);
    const budget       = parseBudget(searchQuery);
    const inStock      = ranked.filter((entry) => Number(entry.product.stock) > 0);
    const budgetMatches = budget === null ? inStock : inStock.filter((entry) => entry.inBudget);
    const relevantCandidates = budgetMatches.filter((entry) => entry.matches.length > 0 || entry.score >= 0.3);
    const selected     = relevantCandidates.slice(0, 4);

    // Try LLM for the human-readable answer text
    let answer   = null;
    let provider = 'Conversational Recommendation Agent';
    let ollamaOk = false;

    try {
      ollamaOk = await isOllamaRunning();
    } catch { /* ignore */ }

    if (ollamaOk) {
      try {
        // Build catalog context.
        // If no TF-IDF matches found, explicitly tell Qwen there are no results
        // rather than feeding it random unrelated products (which causes hallucination).
        let catalogBlock;
        if (selected.length > 0) {
          catalogBlock = buildCatalogContext(selected.map((e) => e.product));
        } else {
          catalogBlock = '(no matching products found in the catalog for this request)';
        }

        const systemPrompt = `You are Luxe, a warm, intelligent human-like shopping assistant for Luxe Commerce — a premium Nepali e-commerce store.

You can:
- Chat naturally and answer general questions about technology, lifestyle, shopping tips, comparisons, and more
- Greet users, joke around, and be personable
- Recommend products from the catalog when the user is shopping or asks for suggestions

Guidelines:
- NEVER use robotic phrases like "I'm sorry, but I can't assist with that request" or "As an AI". Speak completely naturally like a human.
- CRITICAL: You MUST ONLY recommend products that appear in the PRODUCT CATALOG below. NEVER invent, guess, or mention any product name, brand, price, or spec that is not explicitly listed in the catalog. If the catalog says "no matching products found", tell the user honestly that you don't currently carry that item and suggest they try a different search.
- Always mention prices in Rupees (Rs.) when discussing products from the catalog.
- Keep responses conversational and concise (3–6 sentences).
- If the user greets you or asks a general question, respond naturally like a helpful human assistant.

PRODUCT CATALOG (ONLY recommend items listed here — do NOT invent any others):
${catalogBlock}`;

        // Use llmContext (full history joined) so Qwen understands the conversation flow.
        const userMessage = llmContext;
        answer   = await chat({ systemPrompt, userMessage });
        provider = `Qwen ${MODEL.split(':')[1] || '1.5B'} (local)`;
      } catch (llmErr) {
        console.error('[Ollama] recommendProducts LLM error:', llmErr.message);
      }
    }

    // Fallback to the original template-based answer
    if (!answer) {
      if (selected.length === 0) {
        answer = `I could not find an in-stock product that matches "${searchQuery}" closely enough. Try adding a use case, category, or budget so I can narrow it down.`;
      } else {
        const intro = `I understood that you are looking for "${searchQuery}". Here are the strongest matches from our catalog:`;
        const lines = selected.map((entry, index) => {
          const effPrice = Number(entry.effectivePrice).toLocaleString('en-IN');
          const discount = Number(entry.product.discount_percentage) || 0;
          const priceText = discount > 0
            ? `Rs. ${effPrice} after ${discount}% off`
            : `Rs. ${effPrice}`;
          return `${index + 1}. ${entry.product.title} — ${priceText} (${buildRecommendationReason(entry, budget)}).`;
        });
        answer = [intro, ...lines].join('\n');
      }
      provider = 'Conversational Recommendation Agent';
    }

    res.json({
      answer,
      recommendedProducts: selected.map((entry) => toProductResponse(entry.product, {
        ...entry,
        reason: buildRecommendationReason(entry, budget),
      })),
      provider,
      usedConversationContext: Boolean(conversation?.length && conversation.length > 1),
    });
  } catch (error) {
    console.error('Recommendation error:', error);
    res.status(500).json({ message: error.message || 'Recommendation failed' });
  }
};
