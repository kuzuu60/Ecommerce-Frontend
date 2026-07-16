const stopWords = new Set([
    'a', 'about', 'an', 'and', 'are', 'be', 'for', 'from', 'i', 'in', 'is',
    'it', 'me', 'my', 'of', 'on', 'or', 'that', 'the', 'this', 'to', 'want',
    'with', 'you', 'your', 'under', 'below', 'less', 'than', 'upto', 'up',
    'maximum', 'max', 'within', 'budget', 'rs', 'npr', 'inr', 'price'
]);

const categoryAliases = new Map([
    ['laptop', 'laptops'], ['notebook', 'laptops'], ['computer', 'laptops'], ['pc', 'laptops'], ['macbook', 'laptops'],
    ['phone', 'smartphones'], ['mobile', 'smartphones'], ['smartphone', 'smartphones'], ['iphone', 'smartphones'], ['android', 'smartphones'],
    ['tablet', 'tablets'], ['ipad', 'tablets'],
    ['accessory', 'mobile-accessories'], ['accessories', 'mobile-accessories'], ['charger', 'mobile-accessories'], ['case', 'mobile-accessories'],
    ['furniture', 'furniture'], ['sofa', 'furniture'], ['bed', 'furniture'], ['chair', 'furniture'], ['desk', 'furniture'],
    ['decor', 'home-decoration'], ['decoration', 'home-decoration'], ['lamp', 'home-decoration'], ['plant', 'home-decoration'],
    ['kitchen', 'kitchen-accessories'], ['cookware', 'kitchen-accessories'], ['spatula', 'kitchen-accessories'],
    ['sport', 'sports-accessories'], ['sports', 'sports-accessories'], ['fitness', 'sports-accessories'], ['gym', 'sports-accessories'],
    ['sunglasses', 'sunglasses'], ['glasses', 'sunglasses']
]);

const normalize = (value) => String(value || '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();

const tokenize = (value) => normalize(value)
    .split(/\s+/)
    .filter((token) => token.length > 1 && !stopWords.has(token));

const parseBudget = (requirements) => {
    const text = String(requirements || '').replace(/,/g, '');
    const match = text.match(/(?:under|below|less than|upto|up to|maximum|max|within|budget)\s*(?:rs\.?|npr\.?|inr\.?|₹)?\s*(\d+(?:\.\d+)?)\s*(k|thousand|lakh)?/i);
    if (!match) return null;

    const amount = Number(match[1]);
    const multiplier = match[2]?.toLowerCase();
    if (!Number.isFinite(amount)) return null;
    if (multiplier === 'k' || multiplier === 'thousand') return amount * 1000;
    if (multiplier === 'lakh') return amount * 100000;
    return amount;
};

const getCategories = (tokens) => [...new Set(tokens.map((token) => categoryAliases.get(token)).filter(Boolean))];

const buildDocument = (product) => [
    product.title,
    product.category,
    product.brand,
    product.description,
    product.specs
].filter(Boolean).join(' ');

const buildIdf = (products) => {
    const documentFrequency = new Map();
    products.forEach((product) => {
        new Set(tokenize(buildDocument(product))).forEach((token) => {
            documentFrequency.set(token, (documentFrequency.get(token) || 0) + 1);
        });
    });

    return (token) => Math.log((products.length + 1) / ((documentFrequency.get(token) || 0) + 1)) + 1;
};

const cosineSimilarity = (queryTokens, documentTokens, getIdf) => {
    const queryVector = new Map();
    const documentVector = new Map();
    queryTokens.forEach((token) => queryVector.set(token, (queryVector.get(token) || 0) + getIdf(token)));
    documentTokens.forEach((token) => documentVector.set(token, (documentVector.get(token) || 0) + getIdf(token)));

    let dotProduct = 0;
    let queryMagnitude = 0;
    let documentMagnitude = 0;
    queryVector.forEach((value, token) => {
        dotProduct += value * (documentVector.get(token) || 0);
        queryMagnitude += value ** 2;
    });
    documentVector.forEach((value) => { documentMagnitude += value ** 2; });

    if (!queryMagnitude || !documentMagnitude) return 0;
    return dotProduct / (Math.sqrt(queryMagnitude) * Math.sqrt(documentMagnitude));
};

const recommendProducts = (products, requirements) => {
    const queryTokens = tokenize(requirements);
    const queryCategories = getCategories(queryTokens);
    const budget = parseBudget(requirements);
    const getIdf = buildIdf(products);

    return products.map((product) => {
        const documentTokens = tokenize(buildDocument(product));
        const documentTokenSet = new Set(documentTokens);
        const similarity = cosineSimilarity(queryTokens, documentTokens, getIdf);
        const categoryMatch = queryCategories.includes(normalize(product.category)) ? 1 : 0;
        const brandMatch = product.brand && normalize(requirements).includes(normalize(product.brand)) ? 1 : 0;
        const inBudget = budget === null || Number(product.price) <= budget;
        const budgetScore = budget === null ? 0 : inBudget ? 0.2 : -0.35;
        const stockScore = Number(product.stock) > 0 ? 0.03 : -0.2;
        const score = similarity * 0.67 + categoryMatch * 0.2 + brandMatch * 0.1 + budgetScore + stockScore;
        const matches = [...new Set(queryTokens.filter((token) => documentTokenSet.has(token)))].slice(0, 4);

        return { product, score, matches, inBudget };
    }).sort((left, right) => {
        if (right.score !== left.score) return right.score - left.score;
        return Number(left.product.price) - Number(right.product.price);
    });
};

module.exports = { recommendProducts, parseBudget };
