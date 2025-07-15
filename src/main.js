// Vue and plugins
import { createApp } from "vue";
import { createPinia } from "pinia";
import Toast from 'vue-toastification'
import 'vue-toastification/dist/index.css'

// Main App component
import App from "./App.vue";
// Router
import router from "./components/router/index.js";

// Styles
import "./style.css";
import "./main.scss"

// Create Vue application
const app = createApp(App);

// Register plugins
app.use(router);
app.use(createPinia());
app.use(Toast)

// Mount the application
app.mount("#app");