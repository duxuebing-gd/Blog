// @ts-check

import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import { defineConfig } from 'astro/config';

// 部署后请将 site 改为你的 Cloudflare Pages 域名或自定义域名
// 例如：https://personal-blog.pages.dev 或 https://yourdomain.com
export default defineConfig({
	site: 'https://personal-blog.pages.dev',
	integrations: [mdx(), sitemap()],
});
