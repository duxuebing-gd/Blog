// @ts-check

import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import { defineConfig } from 'astro/config';

// Cloudflare Pages 生产域名（Deployments 页 Production 里显示的地址）
export default defineConfig({
	site: 'https://duxuebing-blog.pages.dev',
	integrations: [mdx(), sitemap()],
});
