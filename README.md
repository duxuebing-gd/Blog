# 个人笔记博客

基于 [Astro](https://astro.build/) 搭建的个人博客，用于记录技术学习、英语笔记与生活感悟。通过 GitHub + Cloudflare Pages 免费部署，全球 CDN 加速。

## 功能

- Markdown 写文章，Git 版本管理
- 三个分类：技术 / 英语 / 生活
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
└── life/           # 生活感悟
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

## 部署到 Cloudflare Pages

### 第一步：推送到 GitHub

1. 在 GitHub 创建新仓库（例如 `personal-blog`）
2. 更新 `src/consts.ts` 中的 `GITHUB_REPO` 为你的仓库地址
3. 更新 `astro.config.mjs` 中的 `site` 为你的域名（部署后可改）

```bash
git add .
git commit -m "Initial blog setup"
git remote add origin git@github.com:YOUR_USERNAME/personal-blog.git
git push -u origin main
```

### 第二步：连接 Cloudflare Pages

1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. 进入 **Workers & Pages** → **Create** → **Pages** → **Connect to Git**
3. 选择你的 GitHub 仓库
4. 构建设置：

| 配置项 | 值 |
|--------|-----|
| Framework preset | Astro |
| Build command | `npm run build` |
| Build output directory | `dist` |
| Node.js version | `22`（环境变量 `NODE_VERSION=22`） |

5. 点击 **Save and Deploy**

部署完成后，你会获得一个 `https://xxx.pages.dev` 的免费域名。

### 第三步：绑定自定义域名（可选）

在 Cloudflare Pages 项目设置 → **Custom domains** 中添加你的域名。如果域名已在 Cloudflare 管理，会自动配置 DNS 和 HTTPS。

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
