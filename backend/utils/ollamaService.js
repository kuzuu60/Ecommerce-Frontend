'use strict';

/**
 * ollamaService.js
 *
 * Thin wrapper around the Ollama local REST API (http://localhost:11434).
 * Responsibilities:
 *   - Check that Ollama is reachable
 *   - Pull qwen2.5:1.5b if it is not already cached locally
 *   - Warm-start the model at server boot (keeps weights resident in RAM)
 *   - Expose a `chat()` helper used by qaController
 */

const OLLAMA_BASE = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
const MODEL       = process.env.OLLAMA_MODEL      || 'qwen2.5:3b';

// How long to wait for a regular chat response (ms)
const CHAT_TIMEOUT_MS  = 120_000;  // 2 min – generous for integrated GPU
// How long to wait for the warm-start ping (ms)
const WARM_TIMEOUT_MS  =  60_000;  // 1 min

// ─── helpers ────────────────────────────────────────────────────────────────

/**
 * fetchWithTimeout – wraps native fetch with an AbortController deadline.
 */
async function fetchWithTimeout(url, options, timeoutMs) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    return await fetch(url, { ...options, signal: ctrl.signal });
  } finally {
    clearTimeout(timer);
  }
}

// ─── public API ─────────────────────────────────────────────────────────────

/**
 * isOllamaRunning()
 * Returns true if the Ollama daemon is reachable.
 */
async function isOllamaRunning() {
  try {
    const res = await fetchWithTimeout(`${OLLAMA_BASE}/api/tags`, {}, 5_000);
    return res.ok;
  } catch {
    return false;
  }
}

/**
 * ensureModel()
 * Checks if MODEL is already pulled; if not, pulls it.
 * This is a blocking operation and can take a few minutes on first run.
 */
async function ensureModel() {
  console.log(`[Ollama] Checking for model: ${MODEL}`);
  try {
    // List local models
    const res = await fetchWithTimeout(`${OLLAMA_BASE}/api/tags`, {}, 10_000);
    if (!res.ok) throw new Error(`Ollama /api/tags returned ${res.status}`);
    const data = await res.json();
    const models = (data.models || []).map((m) => m.name);
    const modelPresent = models.some(
      (m) => m === MODEL || m.startsWith(MODEL.split(':')[0])
    );

    if (modelPresent) {
      console.log(`[Ollama] Model "${MODEL}" already available locally.`);
      return;
    }

    console.log(`[Ollama] Model "${MODEL}" not found – pulling now (this may take a few minutes on first run)…`);
    // Pull the model – stream the response so we can log progress dots
    const pullRes = await fetch(`${OLLAMA_BASE}/api/pull`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: MODEL, stream: true }),
    });

    if (!pullRes.ok) throw new Error(`Pull failed with status ${pullRes.status}`);

    // Consume the NDJSON stream and log progress
    const reader = pullRes.body.getReader();
    const dec    = new TextDecoder();
    let lastStatus = '';
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      const lines = dec.decode(value).split('\n').filter(Boolean);
      for (const line of lines) {
        try {
          const obj = JSON.parse(line);
          if (obj.status && obj.status !== lastStatus) {
            console.log(`[Ollama] ${obj.status}`);
            lastStatus = obj.status;
          }
        } catch { /* skip malformed lines */ }
      }
    }
    console.log(`[Ollama] Model "${MODEL}" pulled successfully.`);
  } catch (err) {
    console.error(`[Ollama] ensureModel failed: ${err.message}`);
    throw err;
  }
}

/**
 * warmModel()
 * Sends a minimal inference request so Ollama loads the model weights into
 * CPU/GPU memory before the first real user request arrives.
 * Called once at server start.
 */
async function warmModel() {
  try {
    console.log(`[Ollama] Warming model "${MODEL}"…`);
    const res = await fetchWithTimeout(
      `${OLLAMA_BASE}/api/generate`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: MODEL,
          prompt: 'hello',
          stream: false,
          // keep_alive tells Ollama to keep the model in RAM for 30 min
          keep_alive: '30m',
        }),
      },
      WARM_TIMEOUT_MS
    );
    if (res.ok) {
      console.log(`[Ollama] Model "${MODEL}" is warm and ready.`);
    } else {
      const txt = await res.text().catch(() => '');
      console.warn(`[Ollama] Warm-start responded ${res.status}: ${txt.slice(0, 120)}`);
    }
  } catch (err) {
    console.warn(`[Ollama] Warm-start failed (non-fatal): ${err.message}`);
  }
}

/**
 * chat({ systemPrompt, userMessage, history })
 *
 * Sends a conversation to the model using Ollama's /api/chat endpoint.
 *
 * @param {string}   systemPrompt  - Instructions / context for the model
 * @param {string}   userMessage   - The user's latest message
 * @param {Array}    history       - Optional prior [{role, content}] turns
 * @returns {Promise<string>}      - The assistant's text reply
 */
async function chat({ systemPrompt, userMessage, history = [] }) {
  const messages = [
    { role: 'system', content: systemPrompt },
    ...history,
    { role: 'user', content: userMessage },
  ];

  const res = await fetchWithTimeout(
    `${OLLAMA_BASE}/api/chat`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: MODEL,
        messages,
        stream: false,
        keep_alive: '30m',
        options: {
          temperature: 0.3,   // lower = more factual, less creative
          top_p: 0.9,
          num_predict: 512,   // max tokens in the reply
        },
      }),
    },
    CHAT_TIMEOUT_MS
  );

  if (!res.ok) {
    const errText = await res.text().catch(() => '');
    throw new Error(`Ollama chat error ${res.status}: ${errText.slice(0, 200)}`);
  }

  const data = await res.json();
  return (data.message?.content || '').trim();
}

// ─── setup routine called at server start ───────────────────────────────────

/**
 * setupOllama()
 * Full initialization sequence:
 *   1. Verify daemon is running
 *   2. Ensure the model is pulled
 *   3. Warm the model (keeps it in RAM)
 *
 * Intended to be called once from server.js, non-blocking.
 */
async function setupOllama() {
  const running = await isOllamaRunning();
  if (!running) {
    console.warn(
      '[Ollama] ⚠  Ollama daemon is NOT reachable at ' + OLLAMA_BASE +
      '. The AI assistant will fall back to the built-in rule-based responses. ' +
      'Start Ollama with: ollama serve'
    );
    return;
  }
  await ensureModel();
  await warmModel();
}

module.exports = { setupOllama, warmModel, chat, isOllamaRunning, MODEL };
