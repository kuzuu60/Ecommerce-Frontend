<template>
  <div>
    <!-- ── HERO ──────────────────────────────────────────────────── -->
    <section class="hero-section" ref="heroSection">
      <div class="hero-split">
        <!-- Left: Typography -->
        <div class="hero-text relative z-10">
          <!-- Ambient glowing orb behind text -->
          <div class="absolute -top-20 -left-20 w-72 h-72 rounded-full blur-[80px] pointer-events-none z-[-1]" style="background: radial-gradient(circle, rgba(251,191,36,0.1), transparent 70%);"></div>
          
          <div class="overflow-hidden mb-6 flex items-center gap-3">
            <span class="w-8 h-[1px]" style="background: var(--amber-600); transform: scaleX(0); transform-origin: left;" ref="heroLine"></span>
            <p class="section-label m-0" ref="tagline" style="transform: translateY(110%); opacity: 0; color: var(--amber-600); letter-spacing: 0.2em;">Curated Essentials</p>
          </div>
          <div class="overflow-hidden">
            <h1 class="hero-h1" ref="heroH1" style="transform: translateY(110%); opacity: 0;">
              Everything<br /><em class="gradient-text">you love,</em><br />one place.
            </h1>
          </div>
          <div class="overflow-hidden mt-6">
            <p class="hero-body" ref="heroBody" style="transform: translateY(110%); opacity: 0;">
              From precision tech to elevated home essentials — curated for people who care about how things look and feel.
            </p>
          </div>
          <div ref="heroCTAs" style="opacity: 0; transform: translateY(16px);" class="hero-ctas mt-10">
            <button class="btn-primary group" @click="router.push('/deals')">
              Shop now
              <svg class="w-4 h-4 inline-block ml-1 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3"/></svg>
            </button>
            <button class="btn-ghost group" @click="router.push('/contact')">
              Get in touch
            </button>
          </div>
          <div ref="heroMeta" style="opacity: 0;" class="hero-meta mt-8">
            <span>New here?</span>
            <button class="hero-link" @click="router.push('/auth?mode=signup')">Create account</button>
            <span class="hero-divider">·</span>
            <button class="hero-link muted" @click="router.push('/auth')">Sign in</button>
          </div>
        </div>

        <!-- Right: Image -->
        <div class="hero-image-wrap" ref="heroImageWrap" style="opacity: 0; transform: scale(0.97);">
          <div class="hero-image-frame">
            <img src="/assets/hero_cream.png" alt="Curated premium lifestyle products" class="hero-img" />
            <!-- Floating badge -->
            <div class="hero-badge" ref="heroBadge" style="opacity: 0; transform: translateY(8px);">
              <div class="hero-badge-dot"></div>
              <span>Free shipping on orders above Rs. 5,000</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ── PRODUCT RECOMMENDATIONS ────────────────────────────── -->
    <section class="products-outer">
      <div class="max-w-7xl mx-auto px-6 lg:px-12">

        <!-- Loading State -->
        <div v-if="Object.keys(categorizedProducts).length === 0" class="py-24 flex flex-col items-center gap-4" style="color: var(--stone-400);">
          <div class="loading-ring"></div>
          <p class="text-sm font-medium">Loading collection…</p>
        </div>

        <!-- Category Sections -->
        <div v-for="(items, category, idx) in categorizedProducts" :key="category" class="category-block" :ref="el => { if(el) categoryBlocks[idx] = el }">
          <div class="category-header">
            <div>
              <p class="section-label">{{ category }}</p>
              <h2 class="category-title">{{ formatCategory(category) }}</h2>
            </div>
            <button class="btn-text" @click="router.push(`/${category}`)">
              View all <svg class="inline w-3.5 h-3.5 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3"/></svg>
            </button>
          </div>

          <div class="product-grid">
            <div v-for="product in items" :key="product.id" class="product-card" @click="router.push(`/${product.category}/${product.id}`)">
              <div class="product-image-wrap">
                <img :src="product.thumbnail" :alt="product.title" class="product-img" loading="lazy" />
              </div>
              <div class="product-info">
                <p class="product-brand">{{ product.brand }}</p>
                <h3 class="product-name">{{ product.title }}</h3>
                <div class="product-footer">
                  <span class="product-price">Rs. {{ product.price.toLocaleString() }}</span>
                  <button class="product-cta" @click.stop="router.push(`/${product.category}/${product.id}`)">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted, inject, computed, reactive } from 'vue';
import { useRouter } from 'vue-router';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const router = useRouter();
const products = inject("products", ref([]));

// Hero refs
const heroSection = ref(null);
const tagline = ref(null);
const heroLine = ref(null);
const heroH1 = ref(null);
const heroBody = ref(null);
const heroCTAs = ref(null);
const heroMeta = ref(null);
const heroImageWrap = ref(null);
const heroBadge = ref(null);

// Category block refs
const categoryBlocks = reactive({});

// ── Computed: Randomize + Categorize ──────────────────────────
const categorizedProducts = computed(() => {
  if (!products.value?.length) return {};
  const shuffled = [...products.value].sort(() => Math.random() - 0.5);
  const groups = {};
  shuffled.forEach(p => {
    if (!groups[p.category]) groups[p.category] = [];
    if (groups[p.category].length < 4) groups[p.category].push(p);
  });
  return Object.keys(groups).sort().reduce((acc, key) => {
    acc[key] = groups[key];
    return acc;
  }, {});
});

const formatCategory = (slug) =>
  slug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

// ── GSAP Entrance ─────────────────────────────────────────────
onMounted(() => {
  const tl = gsap.timeline({ defaults: { ease: 'power4.out' } });

  tl.to(heroLine.value, {
    scaleX: 1, opacity: 1, duration: 1, ease: 'power3.out'
  }, 0)
  .to([tagline.value, heroH1.value, heroBody.value], {
    y: '0%', opacity: 1, duration: 1.1, stagger: 0.12,
  }, 0.1)
  .to([heroCTAs.value, heroMeta.value], {
    opacity: 1, y: 0, duration: 0.9, stagger: 0.1,
  }, '-=0.7')
  .to(heroImageWrap.value, {
    opacity: 1, scale: 1, duration: 1.2, ease: 'power3.out',
  }, 0.15)
  .to(heroBadge.value, {
    opacity: 1, y: 0, duration: 0.8, ease: 'back.out(1.4)',
  }, 0.9);

  // Scroll trigger for product blocks
  setTimeout(() => {
    Object.values(categoryBlocks).forEach(el => {
      if (!el) return;
      gsap.fromTo(el,
        { y: 40, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.9, ease: 'power3.out',
          scrollTrigger: { trigger: el, start: 'top 85%' }
        }
      );
    });
  }, 800);
});
</script>

<style lang="scss" scoped>
/* ── Hero Section ───────────────────────────────────────────── */
.hero-section {
  min-height: 100vh;
  display: flex;
  align-items: center;
  background: var(--cream-50);
  padding: 7rem 1.5rem 4rem;
}

.hero-split {
  max-width: 1280px;
  width: 100%;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 5rem;
  align-items: center;
  padding: 0 1.5rem;

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
    gap: 3rem;
  }
}

.hero-text {
  display: flex;
  flex-direction: column;
}

.hero-h1 {
  font-family: var(--font-display);
  font-size: clamp(3.5rem, 6vw, 5.8rem);
  font-weight: 400;
  line-height: 1.05;
  color: var(--stone-900);
  letter-spacing: -0.03em;
  margin-bottom: 0.5rem;

  em.gradient-text {
    font-style: italic;
    background: linear-gradient(135deg, var(--amber-600) 0%, #b45309 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    display: inline-block;
    padding-right: 0.2em; /* prevent clipping italic tails */
  }
}

.hero-body {
  font-size: clamp(1rem, 1.5vw, 1.15rem);
  line-height: 1.65;
  color: var(--stone-500);
  max-width: 480px;
  font-weight: 400;
  margin: 0;
}

.hero-ctas {
  display: flex;
  flex-wrap: wrap;
  gap: 0.875rem;
}

.hero-meta {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  font-size: 0.85rem;
  color: var(--stone-400);
}

.hero-link {
  background: none;
  border: none;
  padding: 0;
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--stone-700);
  cursor: pointer;
  transition: color 0.2s;

  &:hover { color: var(--stone-900); }

  &.muted {
    color: var(--stone-400);
    font-weight: 500;
    &:hover { color: var(--stone-600); }
  }
}

.hero-divider { color: var(--cream-300); }

/* ── Hero Image ─────────────────────────────────────────────── */
.hero-image-wrap {
  position: relative;
}

.hero-image-frame {
  border-radius: 24px;
  overflow: hidden;
  position: relative;
  box-shadow: var(--shadow-lg);
  background: var(--cream-100);
  aspect-ratio: 1 / 1;

  @media (max-width: 900px) {
    max-width: 480px;
    margin: 0 auto;
  }
}

.hero-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.hero-badge {
  position: absolute;
  bottom: 20px;
  left: 20px;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  border-radius: 100px;
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--stone-700);
  background: rgba(250, 249, 246, 0.9);
  backdrop-filter: blur(16px);
  border: 1px solid rgba(28, 25, 23, 0.08);
  box-shadow: var(--shadow-md);
}

.hero-badge-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #22C55E;
  box-shadow: 0 0 0 3px rgba(34, 197, 94, 0.2);
  flex-shrink: 0;
}

/* ── Global Buttons ─────────────────────────────────────────── */
.btn-primary {
  padding: 0.875rem 1.75rem;
  border-radius: 100px;
  font-size: 0.9rem;
  font-weight: 600;
  border: none;
  cursor: pointer;
  background: var(--stone-900);
  color: var(--cream-50);
  transition: background 0.2s, transform 0.2s, box-shadow 0.2s;
  box-shadow: 0 2px 8px rgba(28, 25, 23, 0.16);

  &:hover {
    background: var(--stone-700);
    transform: translateY(-1px);
    box-shadow: 0 6px 16px rgba(28, 25, 23, 0.2);
  }
}

.btn-ghost {
  padding: 0.875rem 1.75rem;
  border-radius: 100px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  background: transparent;
  color: var(--stone-700);
  border: 1.5px solid var(--cream-200);
  transition: background 0.2s, border-color 0.2s;

  &:hover {
    background: var(--cream-100);
    border-color: var(--cream-300);
  }
}

.btn-text {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--stone-500);
  padding: 0;
  transition: color 0.2s;
  white-space: nowrap;

  &:hover { color: var(--stone-900); }
}

/* ── Products Outer ─────────────────────────────────────────── */
.products-outer {
  background: var(--cream-50);
  padding: 5rem 0 8rem;
}

.category-block {
  padding-bottom: 5rem;
}

.category-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 2rem;
  padding-bottom: 1.25rem;
  border-bottom: 1px solid var(--cream-200);
}

.category-title {
  font-family: var(--font-display);
  font-size: clamp(1.6rem, 3vw, 2.2rem);
  color: var(--stone-900);
  font-weight: 400;
  margin: 0.25rem 0 0;
  letter-spacing: -0.02em;
}

/* ── Product Grid ───────────────────────────────────────────── */
.product-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1.25rem;

  @media (max-width: 1100px) { grid-template-columns: repeat(3, 1fr); }
  @media (max-width: 760px)  { grid-template-columns: repeat(2, 1fr); }
  @media (max-width: 480px)  { grid-template-columns: 1fr; }
}

.product-card {
  background: #fff;
  border: 1px solid var(--cream-200);
  border-radius: 16px;
  overflow: hidden;
  cursor: pointer;
  transition: box-shadow 0.3s, transform 0.3s, border-color 0.3s;
  display: flex;
  flex-direction: column;

  &:hover {
    box-shadow: var(--shadow-md);
    transform: translateY(-3px);
    border-color: var(--cream-300);
  }
}

.product-image-wrap {
  aspect-ratio: 1 / 1;
  background: var(--cream-100);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.25rem;
  overflow: hidden;
}

.product-img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  transition: transform 0.5s ease;

  .product-card:hover & {
    transform: scale(1.05);
  }
}

.product-info {
  padding: 1rem 1.1rem 1.1rem;
  display: flex;
  flex-direction: column;
  flex: 1;
}

.product-brand {
  font-size: 0.65rem;
  font-weight: 700;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--amber-600);
  margin: 0 0 0.35rem;
}

.product-name {
  font-family: var(--font-body);
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--stone-800);
  line-height: 1.45;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  flex: 1;
  margin: 0 0 1rem;
}

.product-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.product-price {
  font-size: 1rem;
  font-weight: 700;
  color: var(--stone-900);
  letter-spacing: -0.02em;
}

.product-cta {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: 1.5px solid var(--cream-200);
  background: transparent;
  color: var(--stone-500);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background 0.2s, color 0.2s, border-color 0.2s;

  .product-card:hover & {
    background: var(--stone-900);
    color: var(--cream-50);
    border-color: var(--stone-900);
  }
}

/* ── Loading ────────────────────────────────────────────────── */
.loading-ring {
  width: 36px;
  height: 36px;
  border: 2.5px solid var(--cream-200);
  border-top-color: var(--stone-400);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin { to { transform: rotate(360deg); } }

.overflow-hidden { overflow: hidden; }
</style>
