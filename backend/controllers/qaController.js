const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env'), override: true });
const pool = require('../models/db');
const { recommendProducts, parseBudget } = require('../utils/contentBasedRecommender');

const toProductResponse = (product) => ({
  id: product.id,
  title: product.title,
  description: product.description,
  specs: product.specs || '',
  category: product.category,
  price: Number(product.price),
  discountPercentage: Number(product.discount_percentage),
  rating: Number(product.rating),
  stock: product.stock,
  brand: product.brand,
  sku: product.sku,
  weight: Number(product.weight),
  warrantyInformation: product.warranty_information,
  shippingInformation: product.shipping_information,
  availabilityStatus: product.availability_status,
  thumbnail: product.thumbnail,
  images: product.images,
  reviews: product.reviews,
  dimensions: product.dimensions
});

const answerProductQuestion = (product, question) => {
  const normalizedQuestion = question.toLowerCase();
  const price = Number(product.price).toLocaleString('en-IN');
  const specs = product.specs || 'No additional specifications are listed.';

  if (/price|cost|how much|expensive|cheap/.test(normalizedQuestion)) {
    return `${product.title} is currently priced at Rs. ${price}.`;
  }
  if (/stock|available|availability|in stock/.test(normalizedQuestion)) {
    return `${product.title} is ${product.availability_status || 'currently listed'} with ${product.stock ?? 0} item(s) in stock.`;
  }
  if (/ship|delivery|arrive/.test(normalizedQuestion)) {
    return `${product.shipping_information || 'Shipping information is not listed for this product.'}`;
  }
  if (/brand|made by|manufacturer/.test(normalizedQuestion)) {
    return `${product.title} is a ${product.brand || 'Generic'} product in the ${product.category} category.`;
  }
  if (/spec|feature|ram|storage|processor|chip|camera|display|screen|material/.test(normalizedQuestion)) {
    return `${product.title} features: ${specs}. ${product.description || ''}`.trim();
  }

  return `${product.title} is a ${product.brand || 'Generic'} product in the ${product.category} category. ${product.description || 'No description is listed.'} Specifications: ${specs}. It is priced at Rs. ${price}.`;
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
  if (Number(entry.product.rating) > 0) reasons.push(`rated ${Number(entry.product.rating).toFixed(1)}/5`);
  return reasons.join('; ') || 'closest match in the catalog';
};

const buildRecommendationAnswer = (requirements, rankedProducts, budget) => {
  if (rankedProducts.length === 0) {
    return 'I could not find products to recommend from the current catalog.';
  }

  const hasBudgetMatch = budget === null || rankedProducts.some((entry) => entry.inBudget);
  const intro = hasBudgetMatch
    ? `Based on "${requirements}", these products are the closest matches:`
    : `I could not find an exact match within Rs. ${budget.toLocaleString('en-IN')}. These are the closest alternatives:`;
  const lines = rankedProducts.map((entry, index) => {
    const price = Number(entry.product.price).toLocaleString('en-IN');
    return `${index + 1}. ${entry.product.title} — Rs. ${price} (${buildRecommendationReason(entry, budget)}).`;
  });
  return [intro, ...lines].join('\n');
};

exports.recommendProducts = async (req, res) => {
  try {
    const { requirements } = req.body;
    if (!requirements || !requirements.trim()) {
      return res.status(400).json({ message: 'requirements is required' });
    }

    const result = await pool.query('SELECT * FROM products');
    const ranked = recommendProducts(result.rows, requirements.trim());
    const budget = parseBudget(requirements.trim());
    const inStock = ranked.filter((entry) => Number(entry.product.stock) > 0);
    const available = inStock.length > 0 ? inStock : ranked;
    const budgetMatches = budget === null ? available : available.filter((entry) => entry.inBudget);
    const candidates = budgetMatches.length > 0 ? budgetMatches : available;
    const relevantCandidates = candidates.filter((entry) => entry.matches.length > 0 || entry.score >= 0.3);
    const selected = (relevantCandidates.length > 0 ? relevantCandidates : candidates).slice(0, 4);

    res.json({
      answer: buildRecommendationAnswer(requirements.trim(), selected, budget),
      recommendedProducts: selected.map((entry) => toProductResponse(entry.product)),
      provider: 'Content-Based Recommendation'
    });
  } catch (error) {
    console.error('Content-based recommendation error:', error);
    res.status(500).json({ message: error.message || 'Recommendation failed' });
  }
};
