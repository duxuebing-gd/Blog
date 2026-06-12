// @ts-check

import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import { defineConfig } from 'astro/config';

// Cloudflare Pages 生产域名
export default defineConfig({
	site: 'https://blog-6y7.pages.dev',
	integrations: [mdx(), sitemap()],
});
