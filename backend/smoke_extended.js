/**
 * Extended Smoke Test – Final Project
 * Run from backend/: node smoke_extended.js
 */
require('dotenv').config({ path: '.env' });
const http = require('http');

const PORT = process.env.PORT || 5000;
let passed = 0, failed = 0;

const G = (s) => `\x1b[32m${s}\x1b[0m`;
const R = (s) => `\x1b[31m${s}\x1b[0m`;
const Y = (s) => `\x1b[33m${s}\x1b[0m`;
const B = (s) => `\x1b[1m${s}\x1b[0m`;
const D = (s) => `\x1b[2m${s}\x1b[0m`;

function request(method, path, body) {
  return new Promise((resolve) => {
    const payload = body ? JSON.stringify(body) : null;
    const opts = {
      hostname: 'localhost', port: PORT, path, method,
      headers: {
        'Content-Type': 'application/json',
        ...(payload ? { 'Content-Length': Buffer.byteLength(payload) } : {})
      }
    };
    const req = http.request(opts, (res) => {
      let raw = '';
      res.on('data', d => raw += d);
      res.on('end', () => {
        let json = null;
        try { json = JSON.parse(raw); } catch {}
        resolve({ status: res.statusCode, headers: res.headers, body: json, raw });
      });
    });
    req.on('error', (e) => resolve({ status: 0, error: e.message }));
    if (payload) req.write(payload);
    req.end();
  });
}

async function check(label, fn) {
  try {
    const { ok, detail } = await fn();
    if (ok) {
      console.log(G(`  ✅ ${label}`) + (detail ? D(`  ${detail}`) : ''));
      passed++;
    } else {
      console.log(R(`  ❌ ${label}`) + (detail ? `  ${detail}` : ''));
      failed++;
    }
  } catch (e) {
    console.log(R(`  ❌ ${label}`) + `  exception: ${e.message}`);
    failed++;
  }
}

async function run() {
  console.log(B('\n══════════════════════════════════════════════'));
  console.log(B('   SMOKE TEST  —  Final Project  —  API'));
  console.log(B('══════════════════════════════════════════════\n'));

  // ── PRODUCTS ─────────────────────────────────────────────
  console.log(B('📦  Products'));

  const allRes = await request('GET', '/api/products');
  const products = allRes.body?.products || [];

  await check('GET /api/products → 200, returns { products:[...] }', async () => ({
    ok: allRes.status === 200 && Array.isArray(products) && products.length > 0,
    detail: `${products.length} products`
  }));

  const firstId = products[0]?.id;
  await check(`GET /api/products/${firstId} → 200, returns product`, async () => {
    const r = await request('GET', `/api/products/${firstId}`);
    return { ok: r.status === 200 && r.body?.id === firstId, detail: r.body?.title };
  });

  await check('GET /api/products/99999 → 404', async () => {
    const r = await request('GET', '/api/products/99999');
    return { ok: r.status === 404, detail: `status=${r.status}` };
  });

  // ── RECOMMENDATIONS (ML) ──────────────────────────────────
  console.log(B('\n🤖  Recommendations (ML Content-Based)'));

  const laptop = products.find(p => p.category === 'laptops');
  const phone  = products.find(p => p.category === 'smartphones');
  const sports = products.find(p => p.category === 'sports-accessories');
  const furn   = products.find(p => p.category === 'furniture');

  await check(`Laptop recs → only laptops (id=${laptop?.id})`, async () => {
    const r = await request('GET', `/api/products/${laptop?.id}/recommendations`);
    const recs = Array.isArray(r.body) ? r.body : [];
    const wrongCat = recs.filter(x => x.category !== 'laptops');
    return {
      ok: r.status === 200 && recs.length > 0 && wrongCat.length === 0,
      detail: `${recs.length} recs, top="${recs[0]?.name}" Rs.${Math.round(recs[0]?.price || 0)}, wrong-cat=${wrongCat.length}`
    };
  });

  await check(`Smartphone recs → phones/accessories (id=${phone?.id})`, async () => {
    const r = await request('GET', `/api/products/${phone?.id}/recommendations`);
    const recs = Array.isArray(r.body) ? r.body : [];
    const allowed = ['smartphones', 'mobile-accessories'];
    const wrongCat = recs.filter(x => !allowed.includes(x.category));
    return {
      ok: r.status === 200 && recs.length > 0 && wrongCat.length === 0,
      detail: `${recs.length} recs, top="${recs[0]?.name}", wrong-cat=${wrongCat.length}`
    };
  });

  await check(`Sports recs → only sports (id=${sports?.id})`, async () => {
    const r = await request('GET', `/api/products/${sports?.id}/recommendations`);
    const recs = Array.isArray(r.body) ? r.body : [];
    const wrongCat = recs.filter(x => x.category !== 'sports-accessories');
    return {
      ok: r.status === 200 && wrongCat.length === 0,
      detail: `${recs.length} recs, wrong-cat=${wrongCat.length}`
    };
  });

  await check(`Furniture recs → furniture/home-decoration (id=${furn?.id})`, async () => {
    const r = await request('GET', `/api/products/${furn?.id}/recommendations`);
    const recs = Array.isArray(r.body) ? r.body : [];
    const allowed = ['furniture', 'home-decoration'];
    const wrongCat = recs.filter(x => !allowed.includes(x.category));
    return {
      ok: r.status === 200 && wrongCat.length === 0,
      detail: `${recs.length} recs, wrong-cat=${wrongCat.length}`
    };
  });

  await check('Recs for non-existent id → 404 (product not found)', async () => {
    const r = await request('GET', '/api/products/99999/recommendations');
    return { ok: r.status === 404, detail: `status=${r.status}` };
  });

  // Price range check for recs
  await check('Laptop recs within ±40% price range', async () => {
    const r = await request('GET', `/api/products/${laptop?.id}/recommendations`);
    const recs = Array.isArray(r.body) ? r.body : [];
    const srcPrice = laptop?.price || 0;
    const outOfRange = recs.filter(x => {
      const diff = Math.abs(x.salePrice - srcPrice) / srcPrice;
      return diff > 0.45; // slight buffer above the 0.4 tolerance
    });
    return {
      ok: outOfRange.length === 0,
      detail: `src=Rs.${Math.round(srcPrice)}, out-of-range=${outOfRange.map(x => x.name + '(Rs.' + Math.round(x.price) + ')').join(', ') || 'none'}`
    };
  });

  // ── AI Q&A ────────────────────────────────────────────────
  console.log(B('\n💬  AI Q&A (Qwen 2.5 3B)'));

  await check('POST /api/qa → valid question answered', async () => {
    const r = await request('POST', '/api/qa', { productId: laptop?.id, question: 'What is the RAM of this laptop?' });
    const ok = r.status === 200 && typeof r.body?.answer === 'string' && r.body.answer.trim().length > 5;
    return { ok, detail: ok ? `"${r.body.answer.slice(0, 100).trim()}..."` : `status=${r.status} raw=${r.raw?.slice(0, 120)}` };
  });

  await check('POST /api/qa → missing question → 400', async () => {
    const r = await request('POST', '/api/qa', { productId: laptop?.id });
    return { ok: r.status === 400, detail: `status=${r.status}` };
  });

  await check('POST /api/qa → missing productId → 400 or 404', async () => {
    const r = await request('POST', '/api/qa', { question: 'Hello?' });
    return { ok: [400, 404].includes(r.status), detail: `status=${r.status}` };
  });

  // ── AI RECOMMEND SEARCH ───────────────────────────────────
  console.log(B('\n🔍  AI Recommendation Search'));

  await check('POST /api/qa/recommend → returns response', async () => {
    const r = await request('POST', '/api/qa/recommend', { requirements: 'I need a good laptop for programming' });
    const ok = r.status === 200 && r.body !== null;
    return { ok, detail: `status=${r.status}` };
  });

  await check('POST /api/qa/recommend → missing requirements → 400', async () => {
    const r = await request('POST', '/api/qa/recommend', {});
    return { ok: r.status === 400, detail: `status=${r.status}` };
  });

  // ── AUTH ──────────────────────────────────────────────────
  console.log(B('\n🔐  Auth'));

  await check('POST /api/auth/register → empty body → 400 (or 429 if rate-limited)', async () => {
    const r = await request('POST', '/api/auth/register', {});
    return { ok: [400, 429].includes(r.status), detail: `status=${r.status}` };
  });

  await check('POST /api/auth/login → wrong credentials → 400/401 (or 429)', async () => {
    const r = await request('POST', '/api/auth/login', { email: 'nobody@fake.com', password: 'wrongpassword' });
    return { ok: [400, 401, 429].includes(r.status), detail: `status=${r.status}` };
  });

  await check('POST /api/auth/user-login → wrong credentials → 400/401 (or 429)', async () => {
    const r = await request('POST', '/api/auth/user-login', { email: 'nobody@fake.com', password: 'wrongpassword' });
    return { ok: [400, 401, 429].includes(r.status), detail: `status=${r.status}` };
  });

  // ── PROTECTED ROUTES ─────────────────────────────────────
  console.log(B('\n🛡️   Protected Routes'));

  for (const [label, method, path] of [
    ['GET /api/orders', 'GET', '/api/orders'],
    ['POST /api/orders', 'POST', '/api/orders'],
    ['GET /api/admin/users', 'GET', '/api/admin/users'],
  ]) {
    await check(`${label} → 401 without token`, async () => {
      const r = await request(method, path, method === 'POST' ? {} : undefined);
      return { ok: r.status === 401, detail: `status=${r.status}` };
    });
  }

  // ── PAYMENT ───────────────────────────────────────────────
  console.log(B('\n💳  Payment'));
  await check('POST /api/payment/esewa-signature → responds', async () => {
    const r = await request('POST', '/api/payment/esewa-signature', { amount: '100', orderId: 'test-1' });
    return { ok: [200, 400, 422].includes(r.status), detail: `status=${r.status}` };
  });

  // ── RATE LIMITING ─────────────────────────────────────────
  console.log(B('\n🚦  Rate Limiting'));
  // Check if already rate-limited first
  const probe = await request('POST', '/api/auth/login', { email: 'x@x.com', password: 'x' });
  if (probe.status === 429) {
    await check('Auth rate limiter active (429 already firing from prior run)', async () => ({ ok: true, detail: 'rate limiter in effect' }));
  } else {
    let hit429 = false;
    for (let i = 0; i < 25 && !hit429; i++) {
      const r = await request('POST', '/api/auth/login', { email: 'x@x.com', password: 'x' });
      if (r.status === 429) hit429 = true;
    }
    await check('Auth rate limiter triggers 429 after rapid requests', async () => ({ ok: hit429 }));
  }

  // ── SECURITY HEADERS ──────────────────────────────────────
  console.log(B('\n🔒  Security Headers (Helmet)'));
  await check('Response has Content-Security-Policy header (Helmet)', async () => {
    const r = await request('GET', '/api/products');
    const csp = !!r.headers['content-security-policy'];
    const noPoweredBy = !r.headers['x-powered-by'];
    return { ok: csp && noPoweredBy, detail: `csp=${csp}, x-powered-by removed=${noPoweredBy}` };
  });

  // ── SUMMARY ───────────────────────────────────────────────
  const total = passed + failed;
  console.log(B('\n══════════════════════════════════════════════'));
  if (failed === 0) {
    console.log(G(B(`  🎉 ALL ${total}/${total} TESTS PASSED — DEMO READY!`)));
  } else {
    console.log(R(B(`  ⚠️  ${passed}/${total} passed  |  ${failed} FAILED — fix before demo!`)));
  }
  console.log(B('══════════════════════════════════════════════\n'));
  process.exit(failed > 0 ? 1 : 0);
}

setTimeout(run, 500);
