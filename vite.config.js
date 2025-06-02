import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'


// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(), 
    tailwindcss(),
  ],
  base: '/minimal-pairs/', // <--- IMPORTANT: Set this to your GitHub repository name
                           // If your repo is https://<USERNAME>.github.io/minimal-pairs/
                           // then base should be '/minimal-pairs/'
                           // If it's a custom domain or a user/org page (e.g. <USERNAME>.github.io),
                           // then base can be '/'
  ssgOptions: {
      // @ts-ignore -- vite-ssg uses this top-level option via its CLI

    // For dynamic routes like /practice/:langCode, you might need to tell vite-ssg
    // which specific routes to generate if they can't be automatically discovered.
    // This can be done by providing a function that returns an array of paths.
    // However, for routes defined in your router, it often discovers them.
    // If your routes are very dynamic (e.g., from an API), you'd fetch them here.
    // For your case, if 'bn-IN' is the only language for now:
    includedRoutes(paths, routes) {
      // `paths` is an array of existing static routes
      // `routes` is the raw route records
      // You can add more paths to be rendered
      return paths.concat(['/practice/bn-IN', '/practice/bn_IN']); // Add both variants if needed
    },
  },
})