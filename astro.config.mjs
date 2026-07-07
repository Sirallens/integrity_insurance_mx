import { defineConfig } from 'astro/config';
import svelte from '@astrojs/svelte';
import tailwind from '@astrojs/tailwind';

export default defineConfig({
  server: {
    host: true,
    port: 4321
  },
  vite: {
    server: {
      // Allows any ngrok-free.dev subdomain
      allowedHosts: ['.ngrok-free.dev']
    },
  },
  integrations: [
    svelte(),
    tailwind({
      applyBaseStyles: false,
    }),
  ],
  output: 'static',
  i18n: {
    defaultLocale: "es",
    locales: ["en", "es"],
    routing: {
      prefixDefaultLocale: false
    }
  }
});