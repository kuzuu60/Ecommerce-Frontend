# Luxe — AI-Assisted E-Commerce Platform

Luxe is a Vue and Node.js e-commerce application with product discovery, authentication, PostgreSQL-backed orders, content-based recommendations, product Q&A, and eSewa payments.

## Features

- Product browsing by category, search, discounts, stock, and product details
- User registration and JWT-based authentication
- Admin dashboard for products, users, and order status management
- PostgreSQL product, user, admin, and order storage
- Product-specific Q&A based on catalog data
- Natural-language product recommendation assistant
- Similar-product recommendations using a Python machine-learning module
- eSewa ePay v2 payment initiation and signed callback verification
- Local product image uploads

## Technology Stack

- **Frontend:** Vue 3, Vite, Vue Router, Pinia, Tailwind CSS
- **Backend:** Node.js, Express, PostgreSQL, JWT, bcryptjs, Multer
- **Recommendation ML:** Python, pandas, NumPy, SciPy, scikit-learn
- **Payments:** eSewa ePay v2 HMAC-SHA256 signing

## Architecture

```text
Vue frontend
    |
    v
Express REST API ----------> PostgreSQL
    |                             |
    +--> Content-based QA         +--> Products, users, orders, admins
    +--> Python recommender
    +--> eSewa hosted payment form
```

## Requirements

- Node.js 18 or newer
- npm
- Python 3.10 or newer
- PostgreSQL 14 or newer

## Local Setup

### 1. Configure PostgreSQL

Create a PostgreSQL database, then create `backend/.env` using the following values:

```env
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your_database_password
DB_NAME=luxe

JWT_SECRET=replace_with_a_long_random_secret
ADMIN_USERNAME=admin
ADMIN_PASSWORD=replace_with_a_strong_password
ADMIN_SECRET_KEY=replace_with_a_private_admin_setup_key
PORT=5000

# eSewa UAT configuration
ESEWA_PRODUCT_CODE=EPAYTEST
ESEWA_SECRET_KEY=your_esewa_secret_key

# Optional: set this when `python` is not on PATH
# PYTHON_COMMAND=python
```

Do not commit `.env` files or payment credentials.

### 2. Install backend dependencies

```powershell
cd backend
npm install
python -m pip install -r recommender/requirements.txt
```

### 3. Initialize the database

The backend creates the application tables and seeds the admin account when it starts. To import the bundled product catalog into PostgreSQL, run:

```powershell
node migrate_products.js
```

### 4. Install frontend dependencies

```powershell
cd ..\frontend
npm install
```

For a non-default backend URL, create `frontend/.env`:

```env
VITE_API_URL=http://localhost:5000
VITE_ESEWA_FORM_URL=https://rc-epay.esewa.com.np/api/epay/main/v2/form
```

### 5. Run the application

Run the backend and frontend in separate terminals:

```powershell
# Terminal 1
cd backend
npm run dev
```

```powershell
# Terminal 2
cd frontend
npm run dev
```

The frontend is normally available at `http://localhost:5173` and the API at `http://localhost:5000`.

## AI and Recommendation Systems

The current branch does not use a live LLM. The assistant branding refers to deterministic catalog logic and content-based recommendation algorithms.

### Product Q&A

`POST /api/qa` reads a product from PostgreSQL and answers questions using keyword rules for price, stock, shipping, brand, specifications, and general product information.

### Natural-Language Recommendations

`POST /api/qa/recommend` processes requirements such as `I want a laptop under Rs. 150000` using:

- Text normalization and tokenization
- Stop-word removal
- Category aliases
- IDF-weighted cosine similarity
- Category and brand matching
- Budget and stock scoring
- Rating and price tie-breaking

The endpoint returns up to four products with explainable recommendation reasons.

### Similar-Product Recommendations

`GET /api/products/:id/recommendations?topN=5` invokes the Python recommender. It uses:

- TF-IDF text features with unigrams and bigrams
- Standardized price as a weighted numeric feature
- Sparse feature vectors and L2 normalization
- Cosine similarity
- Category and department bonuses
- Stock filtering and explainable match reasons

The Python model is fitted on the current PostgreSQL catalog for each request.

Historical Git branches contain experimental Gemini, OpenAI, and Hugging Face LLM integrations, but they are not active in the current branch.

## eSewa Payment Flow

The current eSewa integration uses the ePay v2 hosted form:

1. The frontend requests a payment signature from `POST /api/payment/esewa-signature`.
2. The backend signs `total_amount,transaction_uuid,product_code` with HMAC-SHA256 and Base64 encoding.
3. The frontend submits the required fields to the eSewa hosted form.
4. eSewa redirects to the configured success or failure URL.
5. The success response is Base64 decoded and verified by `POST /api/payment/esewa-verify`.
6. An order is created only after the callback has a valid signature and `COMPLETE` status.

The test endpoint is:

```text
https://rc-epay.esewa.com.np/api/epay/main/v2/form
```

For production, use the production merchant code, secret, and eSewa production endpoint. Do not expose the secret key in frontend code.

## API Overview

| Area | Method | Endpoint | Access |
| --- | --- | --- | --- |
| Authentication | POST | `/api/auth/register` | Public |
| Authentication | POST | `/api/auth/user-login` | Public |
| Admin login | POST | `/api/auth/login` | Public |
| Admin creation | POST | `/api/auth/admin-register` | Setup key required |
| Products | GET | `/api/products` | Public |
| Product details | GET | `/api/products/:id` | Public |
| Similar products | GET | `/api/products/:id/recommendations` | Public |
| Product Q&A | POST | `/api/qa` | Public |
| Recommendations | POST | `/api/qa/recommend` | Public |
| Orders | POST | `/api/orders` | User JWT |
| Order management | GET/PUT | `/api/orders` | Admin JWT |
| eSewa signing | POST | `/api/payment/esewa-signature` | Backend |
| eSewa verification | POST | `/api/payment/esewa-verify` | Backend |
| User management | GET/PATCH | `/api/admin/users` | Admin JWT |

## Useful Commands

```powershell
# Frontend production build
cd frontend
npm run build

# Frontend linting
npm run lint

# Backend development server
cd ..\backend
npm run dev

# Synchronize generated product specifications
npm run sync:products
```

## Project Structure

```text
backend/
  controllers/       Express request handlers
  models/            PostgreSQL connection and schema
  recommender/       Python content-based recommender
  routes/            API route definitions
  utils/             Catalog recommendation helpers
  data/              Product source data
  uploads/           Uploaded product images

frontend/
  src/components/    Reusable Vue components
  src/services/      Payment and API services
  src/store/         Pinia stores
  src/views/         Customer and admin pages
```

## Security Notes

- Keep `.env` files, database passwords, JWT secrets, service-account files, and eSewa secrets out of Git.
- Use HTTPS and a public success/failure URL in production.
- Verify eSewa payment responses before fulfilling orders.
- Replace the development admin credentials before deployment.

## License

Add the project license that matches your intended distribution before publishing the repository.
