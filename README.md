# Luxe Commerce

Luxe Commerce is a premium e-commerce application featuring a local AI-powered Product Assistant. The system runs entirely on-device using a local LLM, eliminating the need for cloud API keys or external dependencies.

---

## 🚀 Quick Start

### 1. Prerequisites
- **Node.js** (v18+)
- **PostgreSQL** (running locally)
- **Ollama** (for local AI inference)

---

### 2. Setup local AI (Ollama)
1. Download and install [Ollama](https://ollama.com).
2. Start the Ollama daemon:
   ```bash
   ollama serve
   ```
3. (Optional) Pre-pull the model (the backend will also pull this automatically if missing):
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

   # local AI (Ollama) Settings
   OLLAMA_BASE_URL=http://localhost:11434
   OLLAMA_MODEL=qwen2.5:3b
   ```
4. Start the backend:
   ```bash
   npm run dev
   ```
   *Note: On the first run, the backend will verify if `qwen2.5:3b` is pulled and automatically download it if necessary. It will also perform a "warm start" loading the model into GPU/CPU memory so that the first user interaction has zero cold-load latency.*

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
   All tests (Get Products, AI Q&A, AI Recommendations, and Auth Rate limiting) should print a success state (9/9 passed).
