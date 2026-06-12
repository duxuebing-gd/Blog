---
title: '博客搭建完成：Astro + Cloudflare Pages'
description: '记录个人博客的技术选型与搭建过程，使用 Astro 静态站点生成器和 Cloudflare Pages 免费部署。'
pubDate: 2026-06-12
category: tech
tags: [astro, cloudflare, 博客]
---

## 为什么选 Astro

Astro 是一个以内容为中心的静态站点框架，默认输出纯 HTML，加载速度快，非常适合个人博客。文章用 Markdown 编写，支持 frontmatter 元数据，和写笔记的体验很接近。

## 部署方案

整个流程非常简单：

1. 在本地用 Markdown 写文章
2. `git push` 推送到 GitHub
3. Cloudflare Pages 自动构建并发布到全球 CDN

## 本地开发

```bash
npm install
npm run dev      # 本地预览 http://localhost:4321
npm run build    # 构建生产版本到 dist/
```

## 下一步

- 把 `astro.config.mjs` 里的 `site` 改成你的实际域名
- 在 `src/consts.ts` 里更新 GitHub 仓库地址
- 开始写你的第一篇文章！
