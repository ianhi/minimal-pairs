import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  base: '/minimal-pairs/', // <--- IMPORTANT: Set this to your GitHub repository name
                           // If your repo is https://<USERNAME>.github.io/minimal-pairs/
                           // then base should be '/minimal-pairs/'
                           // If it's a custom domain or a user/org page (e.g. <USERNAME>.github.io),
                           // then base can be '/'
})