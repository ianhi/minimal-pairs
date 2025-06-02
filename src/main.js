import { ViteSSG } from 'vite-ssg' // Import ViteSSG
import App from './App.vue'
import './style.css' // Assuming your style.css is moved to src/
// If you're using Tailwind CSS with Vite, its setup might involve importing it here or in a dedicated CSS file.
import { routes } from './router' // Import the routes array

export const createApp = ViteSSG(
  App,
  { routes, base: import.meta.env.BASE_URL }, // Pass your routes and base URL
  ({ app, router, routes: activeRoutes, isClient, initialState }) => { // Renamed 'routes' from context to avoid conflict
    // You can set up plugins, head management, etc. here
    // For example, if you use Pinia:
    // if (import.meta.env.SSR) {
    //   initialState.pinia = pinia.state.value
    // } else {
    //   pinia.state.value = initialState.pinia || {}
    // }
    // app.use(pinia)
  }
)