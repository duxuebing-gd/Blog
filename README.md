# 个人笔记博客

🌐 **在线访问：[https://blog-6y7.pages.dev](https://blog-6y7.pages.dev)**

基于 [Astro](https://astro.build/) 搭建的个人博客，用于记录技术学习、英语笔记、生活感悟与阅读笔记。通过 GitHub + Cloudflare Pages 免费部署，全球 CDN 加速。

## 功能

- Markdown 写文章，Git 版本管理
- 三个分类：技术 / 英语 / 生活与阅读
- RSS 订阅、Sitemap、SEO 友好
- 推送代码自动部署

## 本地开发

```bash
npm install
npm run dev       # http://localhost:4321
npm run build     # 构建到 dist/
npm run preview   # 预览构建结果
```

## 写文章

在 `src/content/blog/` 下按分类创建 Markdown 文件：

```
src/content/blog/
├── tech/           # 技术笔记
├── english/        # 英语学习
└── life/           # 生活感悟与读书笔记
```

每篇文章需要 frontmatter：

```yaml
---
title: '文章标题'
description: '简短描述，用于 SEO 和列表页'
pubDate: 2026-06-12
category: tech        # tech | english | life
tags: [astro, 博客]
---
```

## 部署

博客托管在 [Cloudflare Pages](https://pages.cloudflare.com/)，推送 `main` 分支后自动构建发布。

| 配置项 | 值 |
|--------|-----|
| Build command | `npm run build` |
| Build output | `dist` |
| Node.js | `22` |

## 项目结构

```
├── src/
│   ├── content/blog/     # 文章（Markdown）
│   ├── components/       # 组件
│   ├── layouts/          # 页面布局
│   ├── pages/            # 路由页面
│   └── consts.ts         # 站点配置
├── astro.config.mjs      # Astro 配置（含 site URL）
└── public/               # 静态资源
```

## 自定义

- **站点名称/描述**：编辑 `src/consts.ts`
- **导航栏**：编辑 `src/components/Header.astro`
- **首页内容**：编辑 `src/pages/index.astro`
- **关于页**：编辑 `src/pages/about.astro`
