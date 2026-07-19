import re

import numpy as np
from sklearn.metrics.pairwise import cosine_similarity

from .features import ProductFeatureExtractor
from .preprocessing import prepare_products


STOP_WORDS = {
    'a', 'about', 'an', 'and', 'are', 'for', 'from', 'in', 'is', 'of', 'on',
    'or', 'the', 'this', 'to', 'with', 'featuring', 'feature', 'features',
    'product', 'products', 'design', 'modern', 'quality',
}

MIN_SIMILARITY = 0.1
PRICE_RANGE_TOLERANCE = 0.5
PRICE_FACTOR_WEIGHT = 0.25


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
        candidate_indexes = [
            index for index in np.argsort(-scores)
            if index != target_index
            and self.products.iloc[index]['stock_numeric'] > 0
            and in_price_range[index]
            and scores[index] >= MIN_SIMILARITY
        ]
        if top_n is not None:
            candidate_indexes = candidate_indexes[:min(max(int(top_n), 1), 20)]

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
