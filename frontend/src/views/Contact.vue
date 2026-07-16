<template>
  <div style="background: var(--cream-50); min-height: 100vh;">

    <!-- ── HERO HEADER ─────────────────────────────────────────── -->
    <section class="contact-hero">
      <div class="contact-hero-inner">
        <p class="section-label" style="color: var(--amber-600);">We're here for you</p>
        <h1 class="contact-heading">
          Let's start<br /><em>a conversation.</em>
        </h1>
        <p class="contact-sub">
          Whether you have a question about a product, an order, or just want to say hello — our team is ready to listen.
        </p>
      </div>
      <!-- Decorative Gradient Orbs -->
      <div class="orb orb-1"></div>
      <div class="orb orb-2"></div>
    </section>

    <!-- ── CONTACT GRID ────────────────────────────────────────── -->
    <section class="contact-grid-section">
      <div class="contact-grid">

        <!-- Phone -->
        <div class="contact-card group">
          <div class="card-icon-wrap">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" style="color: var(--stone-700);">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
            </svg>
          </div>
          <div>
            <p class="card-label">Call us directly</p>
            <h3 class="card-title">Talk to Sales</h3>
            <p class="card-desc">Our team is available Monday–Saturday, 10 AM to 7 PM.</p>
            <a href="tel:+9779826724860" class="card-link">
              +977 9826 724 860
              <svg class="w-3.5 h-3.5 inline ml-1 opacity-50 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3"/></svg>
            </a>
          </div>
        </div>

        <!-- Email -->
        <div class="contact-card group">
          <div class="card-icon-wrap">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" style="color: var(--stone-700);">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
            </svg>
          </div>
          <div>
            <p class="card-label">Send a message</p>
            <h3 class="card-title">Email Support</h3>
            <p class="card-desc">For detailed inquiries, returns, or business partnerships.</p>
            <a href="mailto:hello@luxecommerce.np" class="card-link">
              hello@luxecommerce.np
              <svg class="w-3.5 h-3.5 inline ml-1 opacity-50 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3"/></svg>
            </a>
          </div>
        </div>

      </div>
    </section>

    <!-- ── CONTACT FORM + ASIDE ────────────────────────────────── -->
    <section class="form-section">
      <div class="form-grid">

        <!-- Form -->
        <div class="form-card">
          <div class="form-header">
            <p class="section-label mb-2">Send a message</p>
            <h2 class="form-title">We'll get back to you<br />within 24 hours.</h2>
          </div>

          <form @submit.prevent="submitForm" class="space-y-5">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div class="field">
                <label class="field-label">First Name</label>
                <input v-model="form.firstName" type="text" placeholder="Jane" class="field-input" required />
              </div>
              <div class="field">
                <label class="field-label">Last Name</label>
                <input v-model="form.lastName" type="text" placeholder="Doe" class="field-input" required />
              </div>
            </div>
            <div class="field">
              <label class="field-label">Email Address</label>
              <input v-model="form.email" type="email" placeholder="you@example.com" class="field-input" required />
            </div>
            <div class="field">
              <label class="field-label">Subject</label>
              <select v-model="form.subject" class="field-input field-select">
                <option value="" disabled>Choose a topic…</option>
                <option>Product inquiry</option>
                <option>Order issue</option>
                <option>Return or exchange</option>
                <option>Business partnership</option>
                <option>Other</option>
              </select>
            </div>
            <div class="field">
              <label class="field-label">Message</label>
              <textarea v-model="form.message" rows="5" placeholder="Tell us how we can help you…" class="field-input field-textarea" required></textarea>
            </div>

            <div v-if="submitted" class="success-msg">
              <svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
              Message received! We'll be in touch shortly.
            </div>

            <button type="submit" class="submit-btn" :disabled="submitted">
              {{ submitted ? 'Message Sent ✓' : 'Send Message' }}
              <svg v-if="!submitted" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>
            </button>
          </form>
        </div>

        <!-- Aside Info -->
        <div class="form-aside">

          <!-- Hours -->
          <div class="aside-card">
            <h3 class="aside-title">Business Hours</h3>
            <div class="hours-list">
              <div class="hours-row" v-for="row in hours" :key="row.day">
                <span class="hours-day">{{ row.day }}</span>
                <span class="hours-time" :style="row.open ? 'color: var(--stone-700);' : 'color: var(--stone-400);'">{{ row.time }}</span>
              </div>
            </div>
          </div>

          <!-- Promise -->
          <div class="aside-card promise-card">
            <div class="promise-icon">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" style="color: var(--amber-600);">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
              </svg>
            </div>
            <h3 class="aside-title mt-0">Our Promise</h3>
            <p class="aside-desc">Every inquiry is answered personally. No bots, no templates — just genuine help from our team.</p>
            <div class="promise-tags">
              <span class="promise-tag">24h Response</span>
              <span class="promise-tag">Human Support</span>
              <span class="promise-tag">Free Returns</span>
            </div>
          </div>

        </div>
      </div>
    </section>

  </div>
</template>

<script setup>
import { reactive, ref } from 'vue';

const submitted = ref(false);
const form = reactive({ firstName: '', lastName: '', email: '', subject: '', message: '' });

const hours = [
  { day: 'Monday – Friday', time: '10:00 AM – 7:00 PM', open: true },
  { day: 'Saturday', time: '11:00 AM – 6:00 PM', open: true },
  { day: 'Sunday', time: 'Closed', open: false },
];

const submitForm = () => {
  // Simulate form submission
  submitted.value = true;
  setTimeout(() => {
    submitted.value = false;
    Object.assign(form, { firstName: '', lastName: '', email: '', subject: '', message: '' });
  }, 5000);
};
</script>

<style scoped>
/* ── Hero ──────────────────────────────────────────────────────── */
.contact-hero {
  position: relative;
  overflow: hidden;
  padding: 9rem 1.5rem 7rem;
  background: var(--cream-100);
  border-bottom: 1px solid var(--cream-200);
  text-align: center;
}
.contact-hero-inner {
  position: relative;
  z-index: 2;
  max-width: 640px;
  margin: 0 auto;
}
.contact-heading {
  font-family: var(--font-display);
  font-size: clamp(3.2rem, 7vw, 5.5rem);
  font-weight: 400;
  color: var(--stone-900);
  letter-spacing: -0.035em;
  line-height: 1.05;
  margin: 0.75rem 0 1.25rem;
}
.contact-heading em {
  font-style: italic;
  color: var(--stone-500);
}
.contact-sub {
  font-size: 1.05rem;
  color: var(--stone-500);
  line-height: 1.75;
  max-width: 480px;
  margin: 0 auto;
}
/* Decorative orbs */
.orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  pointer-events: none;
  z-index: 0;
}
.orb-1 {
  width: 400px; height: 400px;
  background: radial-gradient(circle, rgba(251,191,36,0.12), transparent 70%);
  top: -100px; right: -80px;
}
.orb-2 {
  width: 300px; height: 300px;
  background: radial-gradient(circle, rgba(28,25,23,0.05), transparent 70%);
  bottom: -60px; left: -40px;
}

/* ── Contact Cards ──────────────────────────────────────────────── */
.contact-grid-section {
  max-width: 1100px;
  margin: 0 auto;
  padding: 5rem 1.5rem 3rem;
}
.contact-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1.5rem;
}
@media (max-width: 860px) { .contact-grid { grid-template-columns: 1fr; } }
@media (min-width: 580px) and (max-width: 860px) { .contact-grid { grid-template-columns: repeat(2, 1fr); } }

.contact-card {
  background: white;
  border: 1px solid var(--cream-200);
  border-radius: 20px;
  padding: 2rem;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  transition: box-shadow 0.3s, transform 0.3s, border-color 0.3s;
  box-shadow: var(--shadow-sm);
}
.contact-card:hover {
  box-shadow: var(--shadow-lg);
  transform: translateY(-4px);
  border-color: var(--cream-300);
}
.card-icon-wrap {
  width: 52px; height: 52px; border-radius: 14px;
  background: var(--cream-100); border: 1px solid var(--cream-200);
  display: flex; align-items: center; justify-content: center;
  transition: transform 0.3s;
}
.contact-card:hover .card-icon-wrap { transform: scale(1.08); }
.card-label {
  font-size: 0.65rem; font-weight: 700; text-transform: uppercase;
  letter-spacing: 0.16em; color: var(--amber-600); margin-bottom: 4px;
}
.card-title {
  font-family: var(--font-display); font-size: 1.35rem;
  color: var(--stone-900); font-weight: 400; letter-spacing: -0.01em;
  margin-bottom: 0.5rem;
}
.card-desc {
  font-size: 0.875rem; color: var(--stone-500); line-height: 1.65;
  margin-bottom: 0.875rem;
}
.card-link {
  font-size: 1rem; font-weight: 700; color: var(--stone-800);
  text-decoration: none; letter-spacing: -0.01em;
  transition: color 0.2s;
}
.card-link:hover { color: var(--amber-600); }
.card-hours {
  display: inline-flex; align-items: center; gap: 7px;
  font-size: 0.8rem; font-weight: 600; color: #16A34A;
}
.hours-dot {
  width: 7px; height: 7px; border-radius: 50%;
  background: #16A34A; box-shadow: 0 0 0 3px rgba(34,197,94,0.2);
  flex-shrink: 0;
}

/* ── Form Section ───────────────────────────────────────────────── */
.form-section {
  max-width: 1100px;
  margin: 0 auto;
  padding: 2rem 1.5rem 8rem;
}
.form-grid {
  display: grid;
  grid-template-columns: 1.6fr 1fr;
  gap: 2rem;
  align-items: start;
}
@media (max-width: 860px) { .form-grid { grid-template-columns: 1fr; } }

.form-card {
  background: white;
  border: 1px solid var(--cream-200);
  border-radius: 24px;
  padding: 2.5rem;
  box-shadow: var(--shadow-md);
}
.form-header { margin-bottom: 2rem; }
.form-title {
  font-family: var(--font-display); font-size: clamp(1.6rem, 3vw, 2.2rem);
  color: var(--stone-900); font-weight: 400; letter-spacing: -0.02em;
  line-height: 1.2;
}
.field { display: flex; flex-direction: column; gap: 7px; }
.field-label {
  font-size: 0.72rem; font-weight: 700; text-transform: uppercase;
  letter-spacing: 0.12em; color: var(--stone-500);
}
.field-input {
  border: 1px solid var(--cream-200); border-radius: 12px;
  padding: 0.8rem 1rem; font-size: 0.9rem;
  color: var(--stone-800); background: var(--cream-50);
  font-family: var(--font-body); outline: none;
  transition: border-color 0.2s, background 0.2s, box-shadow 0.2s;
  width: 100%;
}
.field-input::placeholder { color: var(--stone-400); }
.field-input:focus {
  border-color: var(--stone-400);
  background: white;
  box-shadow: 0 0 0 3px rgba(28,25,23,0.05);
}
.field-select { cursor: pointer; appearance: none; }
.field-textarea { resize: none; }
.success-msg {
  display: flex; align-items: center; gap: 10px;
  padding: 1rem 1.1rem; border-radius: 12px;
  font-size: 0.875rem; font-weight: 600;
  background: rgba(34,197,94,0.07);
  border: 1px solid rgba(34,197,94,0.2);
  color: #16A34A;
}
.submit-btn {
  display: inline-flex; align-items: center; gap: 10px;
  padding: 1rem 2rem; border-radius: 100px; border: none;
  font-size: 0.9rem; font-weight: 700; cursor: pointer;
  background: var(--stone-900); color: var(--cream-50);
  transition: background 0.2s, transform 0.2s, box-shadow 0.2s;
  box-shadow: 0 4px 16px rgba(28,25,23,0.18);
}
.submit-btn:hover:not(:disabled) {
  background: var(--stone-700);
  transform: translateY(-1px);
  box-shadow: 0 8px 24px rgba(28,25,23,0.22);
}
.submit-btn:disabled { opacity: 0.6; cursor: default; }

/* ── Aside ──────────────────────────────────────────────────────── */
.form-aside { display: flex; flex-direction: column; gap: 1.25rem; }
.aside-card {
  background: white; border: 1px solid var(--cream-200);
  border-radius: 20px; padding: 1.75rem;
  box-shadow: var(--shadow-sm);
}
.aside-title {
  font-family: var(--font-display); font-size: 1.2rem;
  color: var(--stone-900); font-weight: 400; letter-spacing: -0.01em;
  margin-bottom: 1rem;
}
.hours-list { display: flex; flex-direction: column; gap: 0.625rem; }
.hours-row { display: flex; justify-content: space-between; align-items: center; }
.hours-day { font-size: 0.8rem; font-weight: 500; color: var(--stone-500); }
.hours-time { font-size: 0.8rem; font-weight: 700; }
.promise-card { background: var(--cream-100); border-color: var(--cream-200); }
.promise-icon {
  width: 44px; height: 44px; border-radius: 12px;
  background: rgba(251,191,36,0.1); border: 1px solid rgba(251,191,36,0.2);
  display: flex; align-items: center; justify-content: center;
  margin-bottom: 1rem;
}
.aside-desc {
  font-size: 0.85rem; color: var(--stone-500); line-height: 1.7;
  margin-bottom: 1.25rem;
}
.promise-tags { display: flex; flex-wrap: wrap; gap: 0.5rem; }
.promise-tag {
  font-size: 0.68rem; font-weight: 700; text-transform: uppercase;
  letter-spacing: 0.1em; padding: 4px 12px; border-radius: 100px;
  background: white; color: var(--stone-600);
  border: 1px solid var(--cream-200);
}
</style>
