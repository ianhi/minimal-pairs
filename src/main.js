import { createApp } from 'vue'
import App from './App.vue'
import './style.css' // Assuming your style.css is moved to src/
// If you're using Tailwind CSS with Vite, its setup might involve importing it here or in a dedicated CSS file.

const app = createApp(App)

import router from './router' // Import the router

app.use(router) // Tell Vue to use the router

app.mount('#app')