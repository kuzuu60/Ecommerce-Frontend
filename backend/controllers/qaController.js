const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env'), override: true });
const pool = require('../models/db');
const { recommendProducts, parseBudget } = require('../utils/contentBasedRecommender');

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
  matchReason: recommendation ? recommendation.reason : undefined
});

const answerProductQuestion = (product, question) => {
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

  if (hasAny(/\b(ship|shipping|delivery|deliver|arrive|receive)\b/, /how long (does delivery|will delivery|until delivery)/)) {
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

    res.json({
      answer: answerProductQuestion(result.rows[0], question.trim()),
      provider: 'Product Catalog'
    });
  } catch (error) {
    console.error('Product question error:', error);
    res.status(500).json({ message: error.message || 'Product question failed' });
  }
};

const buildRecommendationReason = (entry, budget) => {
  const reasons = [];
  if (entry.matches.length > 0) reasons.push(`matches ${entry.matches.slice(0, 3).join(', ')}`);
  if (entry.product.category) reasons.push(`category: ${entry.product.category}`);
  if (budget !== null && entry.inBudget) reasons.push('within your budget');
  return reasons.join('; ') || 'closest match in the catalog';
};

const buildRecommendationAnswer = (requirements, rankedProducts, budget) => {
  if (rankedProducts.length === 0) {
    return `I could not find an in-stock product that matches "${requirements}" closely enough. Try adding a use case, category, or budget so I can narrow it down.`;
  }

  const intro = `I understood that you are looking for "${requirements}". I compared the catalog descriptions, categories, brands, and specifications, then kept the strongest matches:`;
  const lines = rankedProducts.map((entry, index) => {
    const price = Number(entry.effectivePrice).toLocaleString('en-IN');
    const discount = Number(entry.product.discount_percentage) || 0;
    const priceText = discount > 0
      ? `Rs. ${price} after ${discount}% off`
      : `Rs. ${price}`;
    return `${index + 1}. ${entry.product.title} — ${priceText} (${buildRecommendationReason(entry, budget)}).`;
  });
  return [intro, ...lines].join('\n');
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
  return [...context, currentRequest].join(' ');
};

exports.recommendProducts = async (req, res) => {
  try {
    const { requirements, conversation } = req.body;
    if (!requirements || !requirements.trim()) {
      return res.status(400).json({ message: 'requirements is required' });
    }

    const requestWithContext = getConversationRequirements(requirements, conversation);
    const result = await pool.query('SELECT * FROM products');
    const ranked = recommendProducts(result.rows, requestWithContext);
    const budget = parseBudget(requestWithContext);
    const inStock = ranked.filter((entry) => Number(entry.product.stock) > 0);
    const budgetMatches = budget === null ? inStock : inStock.filter((entry) => entry.inBudget);
    const candidates = budgetMatches;
    const relevantCandidates = candidates.filter((entry) => entry.matches.length > 0 || entry.score >= 0.3);
    const selected = relevantCandidates.slice(0, 4);

    res.json({
      answer: buildRecommendationAnswer(requestWithContext, selected, budget),
      recommendedProducts: selected.map((entry) => toProductResponse(entry.product, {
        ...entry,
        reason: buildRecommendationReason(entry, budget)
      })),
      provider: 'Conversational Recommendation Agent',
      usedConversationContext: Boolean(conversation?.length)
    });
  } catch (error) {
    console.error('Content-based recommendation error:', error);
    res.status(500).json({ message: error.message || 'Recommendation failed' });
  }
};
