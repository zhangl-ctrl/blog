# 墨迹博客 / Moji Blog

一个基于 Vue 3 + Vite 构建的个人博客系统，支持文章发布、草稿管理、Markdown 编辑、用户登录与基础权限控制。
A personal blog system built with Vue 3 and Vite, featuring article publishing, draft management, Markdown editing, user authentication, and basic role-based access control.

## 项目简介 / Overview

墨迹博客是一个前端驱动的博客项目，结合了本地 Markdown 文件管理和浏览器端数据存储能力，适合用作个人博客原型、前端练手项目或轻量内容管理系统。
Moji Blog is a frontend-driven blogging project that combines local Markdown file management with browser-side data persistence. It works well as a personal blog prototype, a Vue practice project, or a lightweight content management system.

## 功能特性 / Features

### 面向使用者 / For readers

- 首页文章列表展示 / Home page article listing
- 按标题、内容、标签搜索文章 / Search posts by title, content, and tags
- 标签筛选 / Tag filtering
- 文章详情页 Markdown 渲染 / Markdown rendering on post detail pages
- 评论与回复功能 / Comment and reply support
- 归档页面 / Archive page
- 关于页面 / About page

### 面向创作者与管理者 / For authors and administrators

- Markdown 编辑器与实时预览 / Markdown editor with live preview
- 草稿保存、发布、删除 / Draft save, publish, and delete
- 文章导出为 Markdown 文件 / Export articles as Markdown files
- 本地文章文件读写接口 / Local post file read/write APIs in dev server
- 用户注册、登录、退出 / User registration, login, and logout
- 基于角色的路由访问控制 / Role-based route access control
- 用户管理与文章管理页面 / User management and article management pages

## 技术栈 / Tech Stack

- **Vue 3** - 前端框架 / Frontend framework
- **Vite** - 构建工具与开发服务器 / Build tool and dev server
- **Vue Router** - 路由管理 / Routing
- **Pinia** - 状态管理 / State management
- **Naive UI** - UI 组件库 / UI component library
- **marked** - Markdown 解析 / Markdown parsing
- **idb (IndexedDB)** - 浏览器端数据存储 / Browser-side persistence
- **Sass** - 样式扩展 / Styling

## 快速开始 / Getting Started

### 环境要求 / Requirements

- Node.js 18+（建议） / Node.js 18+ recommended
- npm

### 安装依赖 / Install dependencies

```bash
npm install
```

### 启动开发环境 / Start development server

```bash
npm run dev
```

默认开发地址：`http://localhost:3000`
Default dev URL: `http://localhost:3000`

### 构建生产版本 / Build for production

```bash
npm run build
```

### 本地预览生产构建 / Preview production build

```bash
npm run preview
```

## 默认账号 / Default Account

项目初始化时会在 IndexedDB 中创建一个默认超级管理员账号：
On first initialization, the app seeds a default super admin account in IndexedDB:

- 用户名 / Username: `admin`
- 密码 / Password: `123456`

> 该账号仅适合本地开发与演示环境。
> This account is intended for local development and demo usage only.

## 主要页面 / Main Pages

| 路由 / Route | 页面 / Page | 说明 / Description |
|---|---|---|
| `/` | Home | 首页，展示文章列表与搜索筛选 / Home page with article list, search, and filters |
| `/post/:id` | Post | 文章详情页 / Post detail page |
| `/about` | About | 关于页面 / About page |
| `/login` | Login | 登录页面 / Login page |
| `/register` | Register | 注册页面 / Register page |
| `/editor` | Editor | 新建文章 / Create article |
| `/editor/:id` | EditArticle | 编辑已有文章 / Edit existing article |
| `/drafts` | Drafts | 草稿箱 / Draft list |
| `/archive` | Archive | 归档页 / Archive page |
| `/users` | UserManage | 用户管理，仅超级管理员可访问 / User management, super admin only |
| `/articles` | ArticleManage | 文章管理，管理员可访问 / Article management for admins |

## 数据存储说明 / Data Storage

项目同时使用了文件系统与浏览器本地存储：
The project uses both filesystem-based content and browser-side storage:

- `public/posts/`：存放本地 Markdown 文章文件 / Stores local Markdown post files
- **IndexedDB**：存储用户、文章、标签等业务数据 / Stores users, articles, tags, and related data
- **localStorage**：存储当前登录用户等轻量状态 / Stores lightweight state such as current login session

开发环境下，Vite 自定义插件提供了以下本地接口：
In development, a custom Vite plugin provides local file APIs:

- `GET /api/posts` - 获取文章列表 / Fetch post list
- `GET /api/post?id=...` - 获取单篇文章 / Fetch a single post
- `POST /api/save-post` - 保存文章文件 / Save a post file
- `POST /api/delete-post` - 删除文章文件 / Delete a post file

## 项目结构 / Project Structure

```text
blog/
├── docs/                  # 项目文档 / Project documentation
├── public/
│   └── posts/             # Markdown 文章目录 / Markdown post files
├── src/
│   ├── components/        # 通用组件 / Shared components
│   ├── database/          # IndexedDB 封装 / IndexedDB layer
│   ├── router/            # 路由配置与守卫 / Router config and guards
│   ├── stores/            # Pinia stores
│   ├── views/             # 页面视图 / Page views
│   ├── App.vue            # 应用入口布局 / App shell
│   ├── main.js            # 前端入口 / Frontend entry
│   └── style.css          # 全局样式 / Global styles
├── index.html             # HTML 模板 / HTML template
├── package.json           # 项目脚本与依赖 / Scripts and dependencies
└── vite.config.js         # Vite 配置与本地文件接口 / Vite config and local file APIs
```

## 开发说明 / Development Notes

- 默认端口为 `3000`，配置位于 `vite.config.js`
- 路由中包含登录校验与角色权限控制
- 用户状态由 Pinia 管理，持久化登录状态使用 `localStorage`
- 用户、文章、标签数据通过 IndexedDB 管理
- 文章文件通过 Vite 开发服务器中间件直接读写 `public/posts/`

- Default port is `3000`, configured in `vite.config.js`
- Routes include authentication checks and role-based guards
- User state is managed by Pinia, with login persistence in `localStorage`
- Users, articles, and tags are persisted via IndexedDB
- Markdown post files are read and written through Vite middleware under `public/posts/`

## 部署说明 / Deployment

当前项目更适合本地开发或单机演示环境。由于文章保存与删除依赖开发服务器中的文件接口，直接部署为纯静态站点时，这部分能力不会完整可用。
This project is currently best suited for local development or single-machine demos. Since saving and deleting posts depend on file APIs implemented in the Vite dev server, those capabilities will not fully work in a purely static deployment.

如果要部署到正式环境，建议考虑以下方向：
For production deployment, consider one of these directions:

1. 将文章管理接口迁移到独立后端服务
   Move post management APIs to a dedicated backend service
2. 将用户与文章数据统一存入服务端数据库
   Store users and articles in a server-side database
3. 将 `public/posts/` 作为只读内容源，仅保留前台展示
   Treat `public/posts/` as a read-only content source for rendering only
4. 配合对象存储或 CMS 管理文章内容
   Use object storage or a CMS for content management

## 文档 / Docs

- `docs/PROJECT.md` - 项目说明 / Project details
- `docs/DEVELOPMENT.md` - 开发记录 / Development notes

## License

当前仓库未声明许可证。
No license is currently specified in this repository.
