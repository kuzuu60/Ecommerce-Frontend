# Luxe E-Commerce - Project Memory

## Core Technologies
- Frontend: Vue 3, Vite, TailwindCSS (v4 style setup), GSAP, Pinia, Vue Router
- Backend: Node.js, Express, Neon PostgreSQL, Child Process (Python recommendation script)
- Environment: Python runs from the local `SPC` conda environment on the machine. Port 5001 is used for backend, 5173 for frontend.

## Design Language
- **Liquid Glass / Apple Style:** The UI uses extensive glassmorphism (`backdrop-blur-xl`, `backdrop-blur-md`), dark themes (`bg-slate-950`), glowing accents (`blue-500`, `pink-500`), and subtle borders (`border-white/10`).
- **Typography:** Sleek sans-serif, using Inter or system sans-serif (SF Pro). Large headings with tight tracking for premium feel.
- **Animations:** Awwwards-level GSAP animations. Entrance swipe-up texts, scroll-triggered staggers, and micro-interactions on hover.
- **DRY (Don't Repeat Yourself):** Avoid data repetition on the screen. The interface must remain minimalist and clean.

## Important Architectural Decisions
- The header is a floating pill-shaped liquid-glass nav bar, maximizing screen real estate and symmetry.
- The footer is detailed but organized in clean columns, avoiding clutter in the top-level nav.
- The hero section uses `gsap` for complex timeline animations.

## Known Issues / Quirks
- The Python recommendation engine (`recommendationController.js`) assumes a specific Conda environment path (`/opt/anaconda3/envs/SPC/bin/python`). Always use that environment for ML operations.
- The `sass-embedded` package is required by Vite for CSS preprocessing.

## Long-term Goals
- Maintain 90%+ success rate equivalent precision for the recommendation logic.
- Achieve a fully responsive, app-like feel on mobile.
