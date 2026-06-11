// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

import mdx from '@astrojs/mdx';

export default defineConfig({
  site: 'https://haydenremington.com',
  integrations: [react(), sitemap(), mdx()],
  vite: { plugins: [tailwindcss()] },
});