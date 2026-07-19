from scipy.sparse import csr_matrix, hstack
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.preprocessing import StandardScaler, normalize


class ProductFeatureExtractor:
    def __init__(self, price_weight=0.15):
        self.price_weight = price_weight
        self.vectorizer = TfidfVectorizer(
            lowercase=True,
            ngram_range=(1, 2),
            min_df=1,
            max_features=10000,
            token_pattern=r'(?u)\b[a-zA-Z0-9][a-zA-Z0-9+#.-]*\b',
        )
        self.scaler = StandardScaler()

    def fit_transform(self, frame):
        text_features = self.vectorizer.fit_transform(frame['feature_text'])
        price_column = 'sale_price_numeric' if 'sale_price_numeric' in frame else 'price_numeric'
        price_features = self.scaler.fit_transform(frame[[price_column]])
        combined = hstack([
            text_features,
            csr_matrix(price_features * self.price_weight),
        ], format='csr')
        return normalize(combined, norm='l2', axis=1)
