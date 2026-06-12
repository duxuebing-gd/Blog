// @ts-check

import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import { defineConfig } from 'astro/config';

// Cloudflare Pages 生产域名
export default defineConfig({
	site: 'https://duxuebing.pages.dev',
	integrations: [mdx(), sitemap()],
});
