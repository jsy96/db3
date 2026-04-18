# 项目上下文

## 项目简介

**产品 HS 编码管理系统** - 用于管理产品英文名称和 HS 海关编码的增删查改工具。

### 技术栈
- **框架**: Next.js 16 (App Router)
- **数据库**: PostgreSQL (原生 pg 库)
- **ORM**: 无 (直接使用 SQL)
- **API**: 原生 REST API (`/api/products`)
- **UI**: shadcn/ui + Tailwind CSS 4
- **包管理**: pnpm

### 数据模型

```typescript
// products 表
interface Product {
  id: number;           // 自增主键
  product_name: string;  // 英文品名 (varchar 500)
  hs_code: string;      // HS 编码 (varchar 20)
  created_at: string;   // 创建时间
}
```

## 环境变量配置

```env
# PostgreSQL 连接 (Coze 平台自动注入)
PGDATABASE_URL=postgresql://user:password@host:5432/dbname?sslmode=require

# 其他可选
DATABASE_URL=postgresql://...
```

## 数据库配置

### 表结构
- **表名**: `products`
- **主键**: `id` (serial)
- **序列**: `products_id_seq1`
- **索引**: `product_name` (支持模糊搜索), `hs_code`

### API 端点

| 方法 | 路径 | 功能 |
|------|------|------|
| GET | `/api/products` | 获取产品列表 |
| GET | `/api/products?keyword=xxx` | 搜索产品 |
| POST | `/api/products` | 创建产品 |
| PUT | `/api/products` | 更新产品 |
| DELETE | `/api/products?id=xxx` | 删除产品 |

## 文件结构

```
src/
├── app/
│   ├── page.tsx           # 产品管理主页面
│   └── api/
│       └── products/
│           └── route.ts   # 原生 PostgreSQL API 路由
├── lib/
│   ├── products.ts        # 产品 CRUD 操作 (调用 API)
│   ├── db.ts              # PostgreSQL 连接池
│   └── utils.ts           # 通用工具
└── components/ui/         # shadcn/ui 组件库
```

## 常用命令

```bash
# 安装依赖
pnpm install

# 开发环境
pnpm dev

# 构建生产版本
pnpm build

# 启动生产环境
pnpm start
```

## 功能特性

- ✅ 列表展示 - 分页展示所有产品
- ✅ 新增产品 - 弹窗表单添加新产品
- ✅ 编辑产品 - 点击编辑按钮修改产品信息
- ✅ 删除确认 - 二次确认后删除
- ✅ 搜索筛选 - 支持按品名或 HS 编码搜索

## 技术变更记录

### 2024-04-18: 移除 Supabase 依赖
- 移除了 `@supabase/supabase-js` 依赖
- 创建原生 PostgreSQL API 路由 (`/api/products`)
- 使用 `pg` 库直接连接 PostgreSQL
- 前端通过 REST API 调用，不再依赖 Supabase 客户端

## 注意事项

1. **Supabase 客户端**: 使用 `supabase-client-browser.ts`，通过 `NEXT_PUBLIC_` 环境变量配置
2. **环境变量**: 需要在 `.env.local` 中配置或 Vercel 环境变量中设置
3. **错误处理**: 所有数据库操作都有错误处理和提示
