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
  product_name: string;  // 英文品名
  hs_code: string;       // HS 编码
  created_at: string;    // 创建时间
}
```

## 环境变量配置

```env
# PostgreSQL 连接字符串（必填）
PGDATABASE_URL=postgresql://user:password@host:5432/dbname?sslmode=require

# 或分开配置
DATABASE_URL=postgresql://...
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your_password
DB_NAME=postgres
```

## 数据库配置

### 表结构
- **表名**: `products`
- **主键**: `id` (serial)
- **索引**: `product_name`, `hs_code`

### 初始化 SQL
```sql
CREATE TABLE IF NOT EXISTS products (
  id SERIAL PRIMARY KEY,
  product_name VARCHAR(500) NOT NULL,
  hs_code VARCHAR(20) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_products_name ON products(product_name);
CREATE INDEX IF NOT EXISTS idx_products_hs_code ON products(hs_code);
```

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
│           └── route.ts   # PostgreSQL API 路由
├── lib/
│   ├── products.ts        # 产品 CRUD 操作
│   └── db.ts              # PostgreSQL 连接池
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
