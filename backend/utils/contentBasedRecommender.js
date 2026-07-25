const stopWords = new Set([
    'a', 'about', 'an', 'and', 'are', 'be', 'for', 'from', 'i', 'in', 'is',
    'it', 'me', 'my', 'of', 'on', 'or', 'that', 'the', 'this', 'to', 'want',
    'with', 'you', 'your', 'under', 'below', 'less', 'than', 'upto', 'up',
    'maximum', 'max', 'within', 'budget', 'rs', 'npr', 'inr', 'price'
]);

const queryAliases = new Map([
    ['phone', ['smartphone', 'mobile']],
    ['mobile', ['smartphone', 'phone']],
    ['notebook', ['laptop']],
    ['computer', ['laptop', 'pc']],
    ['study', ['student', 'college', 'university', 'education']],
    ['college', ['student', 'university', 'education']],
    ['university', ['student', 'college', 'education']],
    ['work', ['office', 'business', 'productivity']],
    ['office', ['business', 'productivity']],
    ['gaming', ['game', 'performance']],
    ['camera', ['photography', 'photo']],
    ['photos', ['photography', 'camera']],
    ['cheap', ['affordable', 'budget']],
    ['durable', ['reliable', 'quality']]
]);

const normalize = (value) => String(value || '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();

const stem = (token) => {
    if (token.endsWith('ies')) return token.slice(0, -3) + 'y';
    if (token.endsWith('s') && !token.endsWith('ss') && token.length > 3) return token.slice(0, -1);
    return token;
};

const tokenize = (value) => normalize(value)
    .split(/\s+/)
    .filter((token) => token.length > 1 && !stopWords.has(token));

const expandQueryTokens = (value) => {
    const rawTokens = tokenize(value);
    const expanded = new Set();
    rawTokens.forEach((token) => {
        const stemmed = stem(token);
        expanded.add(token);
        expanded.add(stemmed);
        // Add singular + 's' if not already
        expanded.add(stemmed + 's');
        
        const aliases = queryAliases.get(token) || queryAliases.get(stemmed) || [];
        aliases.forEach((alias) => {
            expanded.add(alias);
            expanded.add(alias + 's');
        });
    });
    return [...expanded];
};

const parseBudget = (requirements) => {
    const text = String(requirements || '').replace(/,/g, '');
    const matches = [...text.matchAll(/(?:under|below|less than|upto|up to|maximum|max|within|budget)\s*(?:rs\.?|npr\.?|inr\.?|₹)?\s*(\d+(?:\.\d+)?)\s*(k|thousand|lakh)?/gi)];
    const match = matches.at(-1);
    if (!match) return null;

    const amount = Number(match[1]);
    const multiplier = match[2]?.toLowerCase();
    if (!Number.isFinite(amount)) return null;
    if (multiplier === 'k' || multiplier === 'thousand') return amount * 1000;
    if (multiplier === 'lakh') return amount * 100000;
    return amount;
};

const buildDocument = (product) => [
    product.title,
    product.category,
    product.brand,
    product.description,
    product.specs,
    product.tags
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

const getEffectivePrice = (product) => {
    const price = Number(product.price) || 0;
    const discount = Number(product.discount_percentage ?? product.discountPercentage ?? 0) || 0;
    return discount > 0 ? Number((price * (1 - discount / 100)).toFixed(2)) : price;
};

const isAccessoryQuery = (queryTokens) => {
    const accessoryKeywords = new Set(['case', 'cover', 'charger', 'cable', 'accessory', 'accessories', 'guard', 'protector', 'bag', 'mouse']);
    return queryTokens.some((token) => accessoryKeywords.has(token));
};

const isDeviceQuery = (queryTokens) => {
    const deviceKeywords = new Set(['phone', 'phones', 'smartphone', 'smartphones', 'mobile', 'mobiles', 'laptop', 'laptops', 'tablet', 'tablets', 'computer', 'notebook']);
    return queryTokens.some((token) => deviceKeywords.has(token));
};

const recommendProducts = (products, requirements) => {
    const queryTokens = expandQueryTokens(requirements);
    const budget = parseBudget(requirements);
    const getIdf = buildIdf(products);
    const wantsAccessory = isAccessoryQuery(queryTokens);
    const wantsDevice = isDeviceQuery(queryTokens);

    return products.map((product) => {
        const documentTokens = tokenize(buildDocument(product));
        const documentTokenSet = new Set(documentTokens);
        let similarity = cosineSimilarity(queryTokens, documentTokens, getIdf);

        const category = String(product.category || '').toLowerCase();
        const title = String(product.title || '').toLowerCase();
        const isAccessoryProduct = category.includes('accessories') || title.includes('case') || title.includes('cover') || title.includes('charger') || title.includes('screen protector');

        // If user is searching for a main device (e.g. phone) and did NOT ask for accessories, penalize accessory products
        if (wantsDevice && !wantsAccessory && isAccessoryProduct) {
            similarity *= 0.05;
        }

        const effectivePrice = getEffectivePrice(product);
        const inBudget = budget === null || effectivePrice <= budget;
        const matches = [...new Set(queryTokens.filter((token) => documentTokenSet.has(token)))].slice(0, 4);

        return { product, score: similarity, matches, inBudget, effectivePrice };
    }).sort((left, right) => {
        if (right.score !== left.score) return right.score - left.score;
        return left.effectivePrice - right.effectivePrice;
    });
};

module.exports = { recommendProducts, parseBudget };
