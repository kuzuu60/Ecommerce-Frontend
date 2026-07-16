import json
import sys

from .model import ContentBasedRecommender


def main():
    payload = json.load(sys.stdin)
    model = ContentBasedRecommender().fit(payload.get('products', []))
    recommendations = model.recommend(
        payload.get('productId'),
        payload.get('topN', 5),
    )
    json.dump(recommendations, sys.stdout)


if __name__ == '__main__':
    try:
        main()
    except Exception as error:
        print(f'Recommender failed: {error}', file=sys.stderr)
        sys.exit(1)
