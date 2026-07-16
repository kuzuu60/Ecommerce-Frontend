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
GET /api/products/:productId/recommendations?topN=5
```

The response is an array containing `productId`, `name`, `similarityScore`, and an explainable `reason`, along with product category, brand, price, and thumbnail data.
