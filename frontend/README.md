# Vue 3 + Vite

This template should help get you started developing with Vue 3 in Vite. The template uses Vue 3 `<script setup>` SFCs, check out the [script setup docs](https://v3.vuejs.org/api/sfc-script-setup.html#sfc-script-setup) to learn more.

Learn more about IDE Support for Vue in the [Vue Docs Scaling up Guide](https://vuejs.org/guide/scaling-up/tooling.html#ide-support).

## Payment demo mode

The checkout uses the local mock eSewa verification route by default so the demo works when the eSewa UAT gateway is unavailable. To use the real eSewa test gateway, set `VITE_ESEWA_MODE=live` in `frontend/.env` and restart Vite.
