<div align="center">

# Veridia

**追踪你阅读、观看和学习的一切。**

一个个人媒体与知识管理平台，用于收集、追踪、回顾和重新发现你的媒体消费记录。

[English](./README.md) | **简体中文**

[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38bdf8?logo=tailwindcss)](https://tailwindcss.com)
[![Supabase](https://img.shields.io/badge/Supabase-可选-3ecf8e?logo=supabase)](https://supabase.com)
[![SQLite](https://img.shields.io/badge/SQLite-本地-003b57?logo=sqlite)](https://www.sqlite.org)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)

<br />

[功能特性](#功能特性) | [快速开始](#快速开始) | [技术栈](#技术栈) | [项目架构](#项目架构) | [API](#jarvis-api)

</div>

---

## 功能特性

### 媒体库
- 在一个地方追踪**书籍、电影、电视剧、文章和课程**
- 卡片视图和列表视图，支持筛选、搜索和排序
- 状态管理：`planned` → `in_progress` → `completed` / `paused` / `dropped` / `archived`
- 进度追踪（页数、分钟、集数、实验）
- 半星评分（0.5–5）

### 笔记与反思
- 记录**引用、评论、笔记、反思和摘要**
- 支持位置元数据（页码、时间戳、剧集）
- 通过 Jarvis 进行 AI 摘要

### 收藏集
- 将媒体归入**主题收藏集**，支持自定义图标和颜色
- 拖拽排序

### 消费洞察
- 消费统计与趋势分析
- 陈旧项目检测（超过 20 天未触碰）
- 活动时间线

### Jarvis API
- 通过 REST API 集成 AI 助手
- 基于令牌的认证，支持细粒度权限（读/写/删除）
- 工具日志与错误追踪

### 双后端
- **Supabase 云端** — 生产就绪，支持 Postgres、RLS 和实时订阅
- **本地 SQLite** — 零配置离线模式，基于 Drizzle ORM

---

## 快速开始

### 环境要求

- Node.js 18+
- npm、yarn、pnpm 或 bun

### 安装

```bash
git clone https://github.com/alvinluo-tech/Veridia.git
cd Veridia
npm install
```

### 本地模式（无需 Supabase）

```bash
npm run dev
```

打开 [http://localhost:3000](http://localhost:3000) 注册新账户。数据存储在 `.veridia/data.db`。

### 导入示例数据

```bash
npx tsx scripts/seed.ts
```

使用 `demo@veridia.app` / `password123` 登录。

### Supabase 模式

1. 在 [supabase.com](https://supabase.com) 创建项目
2. 复制 `.env.example` 到 `.env.local`：
   ```bash
   cp .env.example .env.local
   ```
3. 填入 Supabase 凭据：
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```
4. 执行数据库迁移：
   ```bash
   # 在 Supabase SQL 编辑器中执行 supabase/migrations/001_initial_schema.sql
   ```
5. 启动开发服务器：
   ```bash
   npm run dev
   ```

---

## 技术栈

| 层级 | 技术 |
|------|------|
| 框架 | [Next.js 16](https://nextjs.org)（App Router、Turbopack） |
| 语言 | [TypeScript 5](https://www.typescriptlang.org) |
| 样式 | [Tailwind CSS 4](https://tailwindcss.com) + [shadcn/ui](https://ui.shadcn.com) |
| 认证 | [Supabase Auth](https://supabase.com/auth) / [iron-session](https://github.com/vvo/iron-session) + [bcryptjs](https://github.com/nicolo-ribaudo/bcryptjs) |
| 数据库 | [Supabase Postgres](https://supabase.com/database) / [SQLite](https://www.sqlite.org)（[Drizzle ORM](https://orm.drizzle.team)） |
| 校验 | [Zod](https://zod.dev) |
| 表单 | [React Hook Form](https://react-hook-form.com) |
| 图标 | [Lucide React](https://lucide.dev) |

---

## 项目架构

```
src/
├── app/
│   ├── (auth)/           # 登录与注册页面
│   ├── (dashboard)/      # 受保护的仪表盘页面
│   │   ├── dashboard/    # 概览与统计
│   │   ├── library/      # 媒体库 + 详情页
│   │   ├── notes/        # 笔记与反思
│   │   ├── collections/  # 主题收藏集
│   │   ├── insights/     # 消费分析
│   │   └── settings/     # 用户设置
│   ├── actions/          # 服务端操作（认证、媒体、笔记、收藏集、jarvis）
│   ├── api/              # REST 接口（jarvis、元数据）
│   └── auth/             # OAuth 回调
├── components/
│   ├── layout/           # 侧边栏、顶部导航
│   └── media/            # 媒体卡片、网格、徽章、进度条
├── lib/
│   ├── auth/             # 认证抽象层（Supabase | 本地）
│   ├── db/               # SQLite 连接、Schema、迁移
│   ├── domain/           # 业务逻辑（Supabase 查询）
│   ├── repository/       # 数据访问层
│   │   ├── supabase/     # Supabase 实现
│   │   └── sqlite/       # Drizzle/SQLite 实现
│   ├── metadata/         # 外部 API（Open Library、TMDB、Google Books）
│   ├── supabase/         # Supabase 客户端配置
│   └── utils/            # 通用工具函数
├── types/                # TypeScript 类型定义
middleware.ts             # 路由保护（Edge Runtime）
scripts/                  # 种子脚本
supabase/                 # SQL 迁移文件
```

### 仓储模式

应用使用**仓储模式**抽象数据库层。工厂函数在运行时自动检测后端：

```typescript
// 自动检测：有环境变量用 Supabase，否则用 SQLite
const repo = await getRepository()
const items = await repo.media.searchUserMedia(userId, filters)
```

---

## Jarvis API

Jarvis API 允许 AI 助手通过编程方式与 Veridia 交互。

### 认证

```bash
# 在 设置 → API 令牌 中创建令牌
curl -H "Authorization: Bearer <token>" http://localhost:3000/api/jarvis/<tool>
```

### 可用工具

| 工具 | 方法 | 说明 |
|------|------|------|
| `search` | GET | 搜索媒体项目 |
| `get` | GET | 获取媒体详情 |
| `add` | POST | 添加新媒体项目 |
| `update` | POST | 更新进度或状态 |
| `notes` | GET/POST | 列出或添加笔记 |

---

## 环境变量

| 变量 | 必填 | 说明 |
|------|------|------|
| `NEXT_PUBLIC_SUPABASE_URL` | 否 | Supabase 项目 URL（省略则使用本地模式） |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | 否 | Supabase 匿名密钥 |
| `IRON_SESSION_SECRET` | 否 | 会话加密密钥（至少 32 字符） |

---

## 常用命令

| 命令 | 说明 |
|------|------|
| `npm run dev` | 启动开发服务器 |
| `npm run build` | 生产构建 |
| `npm run start` | 启动生产服务器 |
| `npm run lint` | 运行 ESLint |
| `npx tsx scripts/seed.ts` | 导入示例数据 |

---

## 参与贡献

1. Fork 本仓库
2. 创建功能分支：`git checkout -b feat/your-feature`
3. 使用约定式提交：`git commit -m "feat: add something"`
4. 推送并创建 Pull Request

---

## 许可证

[MIT](./LICENSE)
