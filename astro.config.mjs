import { defineConfig } from 'astro/config';
import svelte from '@astrojs/svelte';
import tailwind from '@astrojs/tailwind';

export default defineConfig({
  server: {
    host: true
  },
  vite: {
    server: {
      allowedHosts: 'all'
    }
  },
  integrations: [
    svelte(),
    tailwind({
      applyBaseStyles: false,
    }),
  ],
  output: 'static',
});
