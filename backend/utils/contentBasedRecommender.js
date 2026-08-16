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
    ['gaming', ['game', 'performance', 'graphics', 'gpu', 'rtx']],
    ['performance', ['gaming', 'game', 'speed', 'fast', 'powerful', 'flagship', 'pro', 'rtx', 'i7', 'i9', 'heavy']],
    ['best', ['top', 'premium', 'flagship', 'pro', 'high', 'ultra']],
    ['high', ['pro', 'max', 'ultra', 'flagship', 'performance']],
    ['top', ['best', 'flagship', 'pro', 'premium']],
    ['camera', ['photography', 'photo']],
    ['photos', ['photography', 'camera']],
    ['cheap', ['affordable', 'budget', 'low']],
    ['budget', ['cheap', 'affordable', 'low']],
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

const parseMinBudget = (requirements) => {
    const text = String(requirements || '').replace(/,/g, '');
    const matches = [...text.matchAll(/(?:over|above|more than|at least|starting from|minimum|min|greater than)\s*(?:rs\.?|npr\.?|inr\.?|₹)?\s*(\d+(?:\.\d+)?)\s*(k|thousand|lakh)?/gi)];
    const match = matches.at(-1);
    if (!match) return null;

    const amount = Number(match[1]);
    const multiplier = match[2]?.toLowerCase();
    if (!Number.isFinite(amount)) return null;
    if (multiplier === 'k' || multiplier === 'thousand') return amount * 1000;
    if (multiplier === 'lakh') return amount * 100000;
    return amount;
};

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

const CATEGORY_KEYWORDS = {
    'laptops': ['laptop', 'laptops', 'macbook', 'notebook', 'chromebook'],
    'smartphones': ['phone', 'phones', 'smartphone', 'smartphones', 'mobile', 'mobiles', 'iphone'],
    'tablets': ['tablet', 'tablets', 'ipad', 'ipads'],
    'mobile-accessories': ['charger', 'chargers', 'case', 'cover', 'screen protector', 'earphones', 'airpods', 'magsafe', 'monopod', 'selfie stick'],
    'kitchen-accessories': ['kitchen', 'pan', 'cookware', 'utensil', 'blender', 'oven', 'stove', 'knife', 'fork', 'spoon', 'plate', 'mug', 'wok'],
    'sports-accessories': ['sports', 'ball', 'bat', 'racket', 'racquet', 'shuttlecock', 'cricket', 'football', 'soccer', 'golf', 'volleyball', 'baseball', 'helmet'],
    'furniture': ['furniture', 'chair', 'table', 'sofa', 'sink', 'desk', 'bed'],
    'home-decoration': ['decoration', 'decor', 'frame', 'plant', 'swing', 'lamp', 'vase', 'showpiece'],
    'sunglasses': ['sunglasses', 'glasses', 'shades', 'eyewear']
};

const detectCategoryIntent = (queryTokens) => {
    const tokens = new Set(queryTokens);
    for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
        if (keywords.some((keyword) => tokens.has(keyword))) {
            return category;
        }
    }
    return null;
};

const buildDocument = (product) => {
    let doc = [
        product.title,
        product.category,
        product.brand,
        product.description,
        product.specs,
        product.tags
    ].filter(Boolean).join(' ');

    const category = String(product.category || '').toLowerCase();
    if (category === 'laptops') {
        doc += ' laptop laptops notebook macbook';
    } else if (category === 'smartphones') {
        doc += ' phone phones smartphone smartphones mobile';
    } else if (category === 'tablets') {
        doc += ' tablet tablets ipad';
    } else if (category === 'sunglasses') {
        doc += ' sunglasses glasses shades eyewear';
    } else if (category === 'furniture') {
        doc += ' furniture chair table sofa desk';
    } else if (category === 'sports-accessories') {
        doc += ' sports equipment ball bat racket';
    }
    return doc;
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
    const deviceKeywords = new Set(['phone', 'phones', 'smartphone', 'smartphones', 'mobile', 'mobiles', 'laptop', 'laptops', 'tablet', 'tablets', 'computer', 'notebook', 'macbook']);
    return queryTokens.some((token) => deviceKeywords.has(token));
};

const isPerformanceQuery = (queryTokens) => {
    const keywords = new Set(['performance', 'fast', 'powerful', 'best', 'gaming', 'flagship', 'pro', 'ultra', 'speed', 'top', 'high']);
    return queryTokens.some((token) => keywords.has(token));
};

const isBudgetQuery = (queryTokens) => {
    const keywords = new Set(['cheap', 'budget', 'affordable', 'low', 'cheapest', 'economic']);
    return queryTokens.some((token) => keywords.has(token));
};

const recommendProducts = (products, requirements) => {
    const queryTokens = expandQueryTokens(requirements);
    const budget = parseBudget(requirements);
    const getIdf = buildIdf(products);
    const wantsAccessory = isAccessoryQuery(queryTokens);
    const wantsDevice = isDeviceQuery(queryTokens);
    const wantsPerformance = isPerformanceQuery(queryTokens);
    const wantsBudget = isBudgetQuery(queryTokens);
    const targetCategory = detectCategoryIntent(queryTokens);

    return products.map((product) => {
        const category = String(product.category || '').toLowerCase();
        
        if (targetCategory && category !== targetCategory) {
            return { product, score: 0, matches: [], inBudget: false, effectivePrice: getEffectivePrice(product) };
        }

        const documentTokens = tokenize(buildDocument(product));
        const documentTokenSet = new Set(documentTokens);
        let similarity = cosineSimilarity(queryTokens, documentTokens, getIdf);

        const title = String(product.title || '').toLowerCase();
        const description = String(product.description || '').toLowerCase();
        const specs = String(product.specs || '').toLowerCase();
        const fullText = `${title} ${specs} ${description}`;
        const isAccessoryProduct = category.includes('accessories') || title.includes('case') || title.includes('cover') || title.includes('charger') || title.includes('screen protector');

        if (wantsDevice && !wantsAccessory && isAccessoryProduct) {
            similarity *= 0.05;
        }

        if (category === 'laptops') {
            if (/m1 pro|m2 pro|m3 max|m4|i9|rtx 3070|rtx 4080|32gb/i.test(fullText)) {
                similarity += 0.35;
            } else if (/i7|16gb|512gb|oled|3k|retina|spectre|zenbook|xps|matebook/i.test(fullText)) {
                similarity += 0.25;
            } else if (/ryzen 5|8gb|yoga|swift/i.test(fullText)) {
                similarity += 0.15;
            }
        }

        if (wantsPerformance) {
            if (/i7|i9|ryzen 7|ryzen 9|rtx|m1|m2|m3|m4|pro|max|ultra|gaming|16gb|32gb|ssd|performance|flagship/i.test(fullText)) {
                similarity *= 1.3;
            }
        }

        const effectivePrice = getEffectivePrice(product);
        const inBudget = budget === null || effectivePrice <= budget;
        const matches = [...new Set(queryTokens.filter((token) => documentTokenSet.has(token)))].slice(0, 4);

        return { product, score: similarity, matches, inBudget, effectivePrice };
    }).sort((left, right) => {
        if (Math.abs(right.score - left.score) > 0.01) return right.score - left.score;
        if (wantsBudget) return left.effectivePrice - right.effectivePrice;
        if (wantsPerformance) return right.effectivePrice - left.effectivePrice;
        return right.score - left.score;
    });
};

module.exports = { recommendProducts, parseBudget, parseMinBudget };
