<template>
  <div class="home-page">
    <section class="hero-panel">
      <div class="hero-content">
        <p class="hero-tagline">Curated essentials for modern living</p>
        <h1>Find everything you need, all in one place.</h1>
        <p class="hero-subtitle">
          From everyday gadgets to elevated home pieces, discover a refined collection designed for comfort, style, and convenience.
        </p>
        <div class="hero-actions">
          <button @click="router.push('/laptops')">Shop now</button>
          <button class="secondary-btn" @click="router.push('/contact')">Contact us</button>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router';

const router = useRouter();
</script>

<style lang="scss" scoped>
.home-page {
  min-height: calc(100vh - 90px);
  background: linear-gradient(135deg, #020617 0%, #0f172a 50%, #111827 100%);
  color: #f8fafc;
}

.hero-panel {
  position: relative;
  min-height: calc(100vh - 90px);
  display: flex;
  align-items: center;
  background-image: linear-gradient(90deg, rgba(2, 6, 23, 0.9) 0%, rgba(2, 6, 23, 0.7) 45%, rgba(2, 6, 23, 0.4) 100%), url("/assets/homepageimg.jpg");
  background-size: cover;
  background-position: center;
  padding: 3rem 1.5rem 4rem;
}

.hero-content {
  max-width: 760px;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 2rem 0;
}

.hero-tagline {
  font-size: 1rem;
  font-weight: 700;
  letter-spacing: 0.28em;
  text-transform: uppercase;
  color: #fda4af;
}

h1 {
  font-size: clamp(2.4rem, 4.5vw, 4.3rem);
  line-height: 1.05;
  font-weight: 800;
  margin: 0;
}

.hero-subtitle {
  font-size: clamp(1rem, 1.8vw, 1.25rem);
  line-height: 1.7;
  color: #e2e8f0;
  max-width: 650px;
}

.hero-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.9rem;
  margin-top: 0.5rem;
}

button {
  border: none;
  border-radius: 999px;
  padding: 0.9rem 1.35rem;
  font-weight: 700;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

button:hover {
  transform: translateY(-1px);
}

.hero-actions button:first-child {
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  color: white;
  box-shadow: 0 15px 30px rgba(37, 99, 235, 0.25);
}

.secondary-btn {
  background: rgba(255, 255, 255, 0.12);
  color: #f8fafc;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.feature-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 1rem;
  padding: 1.25rem 1.5rem 2rem;
}

.feature-card {
  background: rgba(15, 23, 42, 0.8);
  border: 1px solid rgba(148, 163, 184, 0.16);
  border-radius: 1.25rem;
  padding: 1.2rem;
  cursor: pointer;
  transition: transform 0.2s ease, border-color 0.2s ease;
}

.feature-card:hover {
  transform: translateY(-3px);
  border-color: rgba(96, 165, 250, 0.4);
}

.feature-card h3 {
  margin: 0 0 0.4rem;
  font-size: 1.05rem;
  color: #f8fafc;
}

.feature-card p {
  margin: 0;
  color: #cbd5e1;
  line-height: 1.6;
  font-size: 0.95rem;
}

@media (max-width: 900px) {
  .feature-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 640px) {
  .hero-panel {
    min-height: 60vh;
  }

  .feature-grid {
    grid-template-columns: 1fr;
  }
}
</style>
