const technicalPatterns = [
    /\b(?:i[357]|ryzen\s+\d+|m\d(?:\s+pro)?|a\d{2}\s+chip)\b/gi,
    /\b\d+\s?gb(?:\s+ram)?\b/gi,
    /\b(?:ssd|hdd|5g|oled|amoled|bluetooth|wireless)\b/gi
];

const descriptivePatterns = [
    ['retina display', /retina/i],
    ['dual screen', /dual screen/i],
    ['touchscreen', /touchscreen/i],
    ['infinityedge display', /infinityedge/i],
    ['face id', /face id/i],
    ['camera', /camera|photography|photos|selfie/i],
    ['android', /android/i],
    ['ergonomic', /ergonomic/i],
    ['bamboo', /bamboo/i],
    ['aluminium', /aluminium/i],
    ['wooden', /wooden|wood/i],
    ['ceramic', /ceramic/i],
    ['stainless steel', /stainless steel/i],
    ['waterproof', /waterproof/i],
    ['gaming', /gaming/i],
    ['business productivity', /business|excel|office/i],
    ['portable', /portable|on the go/i]
];

const buildProductSpecs = (product, tags = product.tags || []) => {
    const source = `${product.title || ''} ${product.description || ''}`;
    const specs = [...tags].filter(Boolean).map(String);

    for (const pattern of technicalPatterns) {
        const matches = source.match(pattern) || [];
        specs.push(...matches.map((match) => match.trim().toLowerCase()));
    }

    for (const [label, pattern] of descriptivePatterns) {
        if (pattern.test(source)) specs.push(label);
    }

    if (specs.length === 0 && product.category) specs.push(product.category);
    return [...new Set(specs)].join(', ');
};

module.exports = { buildProductSpecs };
