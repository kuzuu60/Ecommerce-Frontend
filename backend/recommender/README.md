# Product Recommendation Module

This module uses content-based filtering with PostgreSQL product attributes:

- `preprocessing.py` cleans missing values, normalizes fields, and maps subcategories into marketplace departments.
- `features.py` combines TF-IDF text vectors with a StandardScaler-normalized price feature.
- `model.py` ranks products with cosine similarity and returns explainable match reasons.
- `cli.py` provides the JSON bridge used by the Express API.

## Setup

Install the Python dependencies from the `backend` directory:

```powershell
python -m pip install -r recommender/requirements.txt
```

The Express API starts the model on demand. Configure `PYTHON_COMMAND` in `.env` only when `python` is not the correct executable.

## API

```text
GET /api/products/:productId/recommendations
```

The response includes only in-stock products with cosine similarity of at least `0.1` and a selling price within ±50% of the selected product. Text similarity contributes 75% of the score and price similarity contributes 25%. It is sorted by the combined score and contains `productId`, `name`, `similarityScore`, `salePrice`, and an explainable `reason`, along with product category, brand, price, and thumbnail data. An optional `topN` query parameter can further limit the threshold-qualified results.
