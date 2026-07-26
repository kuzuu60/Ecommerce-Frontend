import re

import numpy as np
from sklearn.metrics.pairwise import cosine_similarity

from .features import ProductFeatureExtractor
from .preprocessing import prepare_products


STOP_WORDS = {
    # Common English stop words
    'a', 'about', 'an', 'and', 'are', 'for', 'from', 'in', 'is', 'of', 'on',
    'or', 'the', 'this', 'to', 'with', 'featuring', 'feature', 'features',
    'product', 'products', 'design', 'modern', 'quality',
    # Generic category/spec words that appear across many unrelated products
    # after enrichment. Keeping them in TF-IDF would inflate cross-category
    # similarity scores (e.g. a Kitchen Pan matching a Cricket Ball because
    # both have "sports equipment outdoor" in their specs).
    'tool', 'tools', 'equipment', 'accessories', 'accessory',
    'sports', 'sport', 'kitchen', 'home', 'items', 'item',
    'electronics', 'game', 'games', 'outdoor', 'indoor',
    'use', 'used', 'using', 'ideal', 'perfect', 'great', 'good',
    'compatible', 'includes', 'included', 'available',
    # Adjectives that appear everywhere and add zero discriminative signal
    'premium', 'stylish', 'slim', 'powerful', 'durable', 'versatile',
    'compact', 'lightweight', 'portable', 'elegant', 'classic', 'essential',
    'its', 'their', 'your', 'our', 'more', 'also', 'can', 'well', 'provides',
    # Colour words that appear in product names across all categories
    'black', 'white', 'grey', 'gray', 'silver', 'gold', 'red', 'blue', 'green',
    'space',  # e.g. "Space Grey" matching unrelated products
}

MIN_SIMILARITY = 0.15   # raised from 0.12 – require stronger signal before recommending
PRICE_RANGE_TOLERANCE = 0.4   # ±40% — keeps suggestions in a genuinely comparable price bracket
PRICE_FACTOR_WEIGHT = 0.20    # price has meaningful influence; text/spec still dominates at 80%
DEFAULT_TOP_N = 4             # show only the top most-similar products

# Strict allowlist of which categories can appear in recommendations for each
# source category. This prevents cross-department leakage (e.g. iPhones showing
# under a laptop). Pairs that share genuine buyer intent are grouped together
# (smartphones ↔ mobile-accessories, furniture ↔ home-decoration).
# Unknown/new categories fall back to same-category-only via the recommend() logic.
ALLOWED_CATEGORIES = {
    'laptops':             {'laptops'},
    'smartphones':         {'smartphones', 'mobile-accessories'},
    'tablets':             {'tablets', 'mobile-accessories', 'smartphones'},
    'mobile-accessories':  {'mobile-accessories', 'smartphones', 'tablets'},
    'furniture':           {'furniture', 'home-decoration'},
    'home-decoration':     {'home-decoration', 'furniture'},
    'kitchen-accessories': {'kitchen-accessories'},
    'sports-accessories':  {'sports-accessories'},
    'sunglasses':          {'sunglasses'},
}


def _tokens(value):
    return {
        token for token in re.findall(r'[a-z0-9+#.-]+', str(value or '').lower())
        if len(token) > 1 and token not in STOP_WORDS
    }


class ContentBasedRecommender:
    def __init__(self):
        self.products = None
        self.features = None
        self.extractor = ProductFeatureExtractor()

    def fit(self, products):
        self.products = prepare_products(products)
        if self.products.empty:
            self.features = None
            return self
        self.features = self.extractor.fit_transform(self.products)
        return self

    def _explain(self, target, recommendation, price_similarity):
        reasons = []
        if target.category == recommendation.category and target.category:
            reasons.append(f'same category: {target.category}')
        elif target.category_group == recommendation.category_group:
            reasons.append(f'same department: {target.category_group}')

        shared = sorted(_tokens(target.feature_text) & _tokens(recommendation.feature_text))
        if shared:
            reasons.append(f'shared features: {", ".join(shared[:4])}')
        if price_similarity >= 0.67:
            reasons.append('similar price range')
        return '; '.join(reasons) or 'similar product attributes'

    def recommend(self, product_id, top_n=None):
        if self.products is None or self.features is None:
            return []

        try:
            target_id = int(product_id)
        except (TypeError, ValueError):
            return []

        matches = np.flatnonzero(self.products['id'].to_numpy(dtype='int64') == target_id)
        if len(matches) == 0:
            return []

        target_index = int(matches[0])
        target = self.products.iloc[target_index]
        target_category = str(target['category'] or '').strip()

        # Determine which categories are allowed in results for this product.
        # Fall back to same-category-only for any category not in the allowlist
        # (e.g. a newly added category will safely stay within itself).
        allowed = ALLOWED_CATEGORIES.get(target_category, {target_category})

        text_scores = cosine_similarity(self.features[target_index], self.features).ravel()
        target_price = float(target['sale_price_numeric'])
        candidate_prices = self.products['sale_price_numeric'].to_numpy(dtype='float64')
        if target_price > 0:
            price_similarity = np.minimum(target_price, candidate_prices) / np.maximum(target_price, candidate_prices)
            price_similarity = np.nan_to_num(price_similarity, nan=0.0, posinf=0.0, neginf=0.0)
            price_min = target_price * (1 - PRICE_RANGE_TOLERANCE)
            price_max = target_price * (1 + PRICE_RANGE_TOLERANCE)
            in_price_range = (candidate_prices >= price_min) & (candidate_prices <= price_max)
        else:
            price_similarity = np.ones(len(candidate_prices))
            in_price_range = np.ones(len(candidate_prices), dtype=bool)

        scores = (text_scores * (1 - PRICE_FACTOR_WEIGHT)) + (price_similarity * PRICE_FACTOR_WEIGHT)
        scores[target_index] = -1

        def _filter_candidates(apply_price_range):
            return [
                index for index in np.argsort(-scores)
                if index != target_index
                and str(self.products.iloc[index]['category'] or '').strip() in allowed
                and self.products.iloc[index]['stock_numeric'] > 0
                and scores[index] >= MIN_SIMILARITY
                and (not apply_price_range or in_price_range[index])
            ]

        # Apply price range filter; fall back to no price filter if too few results.
        # This handles categories with few items (e.g. furniture has only 5 products)
        # where strict price filtering would leave zero recommendations.
        candidate_indexes = _filter_candidates(apply_price_range=True)
        if len(candidate_indexes) < 2:
            candidate_indexes = _filter_candidates(apply_price_range=False)

        # Use caller's top_n if provided, otherwise fall back to DEFAULT_TOP_N
        limit = int(top_n) if top_n is not None else DEFAULT_TOP_N
        limit = min(max(limit, 1), 20)
        candidate_indexes = candidate_indexes[:limit]

        recommendations = []
        for index in candidate_indexes:
            product = self.products.iloc[index]
            score = max(0.0, min(1.0, float(scores[index])))
            recommendations.append({
                'productId': int(product['id']),
                'name': product['title_display'],
                'category': product['category_display'],
                'brand': product['brand_display'],
                'price': float(product['price_numeric']),
                'salePrice': float(product['sale_price_numeric']),
                'similarityScore': round(score, 4),
                'reason': self._explain(target, product, float(price_similarity[index])),
                'stock': int(product['stock_numeric']),
                'discountPercentage': float(product.get('discountPercentage', 0) or 0),
                'description': product['description'],
                'specs': product['specs'],
                'thumbnail': product.get('thumbnail', ''),
            })
        return recommendations
