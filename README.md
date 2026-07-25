# Luxe Commerce

Luxe Commerce is a premium, full-stack e-commerce application featuring an on-device, Privacy-First AI Product Assistant and a Content-Based Recommendation Engine. The system runs locally using a local LLM (Qwen 2.5 3B via Ollama), eliminating cloud API fees and external dependencies.

---

## 🏗️ Architecture & Features

* **Retrieval-Augmented Generation (RAG)**: Integrates TF-IDF vector retrieval with Qwen 2.5 3B to answer shopping queries based strictly on actual catalog data.
* **Smart Intent & Category Matching**: Features custom stemming, token expansion, and device vs. accessory intent filtering (e.g. searching for "phones" automatically filters out phone cases).
* **Dual Recommendation Engine**:
  * *Node.js In-Memory Engine*: Fast RAG candidate selection & budget parsing.
  * *Python Data Science Microservice*: Hybrid cosine similarity ranking combining text similarity (75%) and price scaling (25%).
* **E-Commerce Suite**: Complete cart management with Pinia, persistent checkout state, eSewa payment integration, and PostgreSQL backend.

---

## 🚀 Quick Start

### 1. Prerequisites
- **Node.js** (v18+)
- **PostgreSQL** (running locally)
- **Ollama** (for local AI inference)

---

### 2. Setup Local AI (Ollama)
1. Download and install [Ollama](https://ollama.com).
2. Start the Ollama daemon:
   ```bash
   ollama serve
   ```
3. (Optional) Pre-pull the model (the backend will automatically pull this if missing):
   ```bash
   ollama pull qwen2.5:3b
   ```

---

### 3. Backend Setup
1. Navigate to the `backend` folder:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure environment variables in `.env` (a template is provided in `.env.example`):
   ```env
   # PostgreSQL Settings
   DB_HOST=localhost
   DB_PORT=5432
   DB_USER=postgres
   DB_PASSWORD=postgres123
   DB_NAME=ecomm_db

   # Local AI (Ollama) Settings
   OLLAMA_BASE_URL=http://localhost:11434
   OLLAMA_MODEL=qwen2.5:3b
   ```
4. Start the backend:
   ```bash
   npm run dev
   ```
   *Note: On the first run, the backend will verify if `qwen2.5:3b` is pulled and automatically download it if necessary. It also performs a warm start to preload the model into memory.*

---

### 4. Frontend Setup
1. Navigate to the `frontend` folder:
   ```bash
   cd ../frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Vite dev server:
   ```bash
   npm run dev
   ```
4. Open your browser at [http://localhost:5173](http://localhost:5173).

---

## 🧪 Smoke Testing

To verify all system endpoints, database connections, rate limiters, and local AI capabilities:
1. Ensure the backend is running.
2. In the `backend` folder, run:
   ```bash
   node smoke-test.js
   ```
   All basic tests and rate-limiting security checks should pass.
