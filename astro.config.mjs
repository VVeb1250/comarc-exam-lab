import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import react from '@astrojs/react';

export default defineConfig({
  site: 'https://vveb1250.github.io',
  base: '/comarc-exam-lab',
  trailingSlash: 'always',
  integrations: [mdx(), react()],
});
