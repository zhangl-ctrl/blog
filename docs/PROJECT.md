# 墨迹博客 - 项目文档

## 项目简介

一个基于 Vue 3 + Vite 的个人博客系统，采用简约优雅的设计风格。

## 技术栈

| 技术 | 版本 | 用途 |
|------|------|------|
| Vue | ^3.5.0 | 框架 |
| Vue Router | ^4.5.0 | 路由 |
| Vite | ^6.2.0 | 构建工具 |
| marked | ^15.0.0 | Markdown 解析 |

## 功能模块

### 1. 首页 (`/`)

- 展示文章列表
- 支持本地存储的文章（发布后自动显示）
- 文章卡片包含：标题、摘要、日期、标签
- 点击卡片跳转文章详情
- 搜索文章（按标题、摘要、标签搜索）
- 标签筛选功能

### 2. 文章详情 (`/post/:id`)

- 渲染 Markdown 内容
- 显示文章标签
- 评论系统（支持回复）
- 评论数据存储在 localStorage
- 返回首页链接

### 3. 关于页面 (`/about`)

- 个人介绍
- 兴趣爱好展示
- 座右铭展示

### 4. 文章编辑器 (`/editor`)

- 左侧 Markdown 编辑区
- 右侧实时预览
- 标题输入
- 标签输入（支持多个标签，回车或逗号添加）
- 置顶文章功能
- 保存草稿（localStorage）
- 导出 MD 文件
- 发布文章到首页

### 5. 草稿箱 (`/drafts`)

- 显示所有草稿列表
- 编辑草稿
- 发布草稿
- 删除草稿

### 6. 归档页面 (`/archive`)

- 按年份分组显示文章
- 每个年份下按月份倒序排列
- 显示格式：2026年3月 (3篇)
- 点击跳转到文章详情

### 7. 通用组件

- Toast 提示组件
- 页面过渡动画

## 页面路由

| 路由 | 页面 | 说明 |
|------|------|------|
| `/` | Home | 首页 |
| `/post/:id` | Post | 文章详情 |
| `/about` | About | 关于 |
| `/editor` | Editor | 文章编辑器 |
| `/drafts` | Drafts | 草稿箱 |
| `/archive` | Archive | 归档页面 |

## 数据存储

- **文章数据**：localStorage (`local_articles`)
- **草稿数据**：localStorage (`article_draft`)
- **评论数据**：localStorage (`comments_{postId}`)

## 设计风格

- 字体：Noto Serif SC（中文）+ Cormorant Garamond（英文）
- 配色：米金色点缀 (#c4a35a)
- 背景：带纹理浅色 (#faf9f7)
- 毛玻璃效果导航栏

## 文件结构

```
blog/
├── public/
│   └── posts/           # Markdown 文章目录
├── src/
│   ├── components/
│   │   └── Toast.vue   # 提示组件
│   ├── router/
│   │   └── index.js    # 路由配置
│   ├── views/
│   │   ├── Home.vue    # 首页
│   │   ├── Post.vue    # 文章详情
│   │   ├── About.vue   # 关于页面
│   │   ├── Editor.vue  # 文章编辑器
│   │   ├── Drafts.vue  # 草稿箱
│   │   └── Archive.vue # 归档页面
│   ├── App.vue
│   ├── main.js
│   └── style.css
├── index.html
├── package.json
└── vite.config.js
```
