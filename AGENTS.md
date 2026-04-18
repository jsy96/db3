# 项目上下文

## 项目简介

**产品 HS 编码管理系统** - 前后端分离架构，通过 WebSocket 通信。

### 技术栈
- **前端**: Next.js 16 (App Router) + shadcn/ui + Tailwind CSS 4
- **后端**: Node.js + WebSocket (ws) + SQLite (better-sqlite3)
- **通信**: WebSocket
- **包管理**: pnpm

## 架构说明

```
┌─────────────────┐         WebSocket          ┌─────────────────┐
│   前端 (Vercel/ │  ◄──────────────────────►  │  后端 (Coze)     │
│   GitHub Pages) │      ws://domain/ws/       │  SQLite DB       │
└─────────────────┘                            └─────────────────┘
```

## 环境变量配置

### 前端 (.env.local)
```env
# 开发环境
NEXT_PUBLIC_WS_URL=ws://localhost:5000/ws/products

# 生产环境（部署后替换为你的公网域名）
NEXT_PUBLIC_WS_URL=wss://your-domain.com/ws/products
```

### 后端
无需配置，使用本地 SQLite 文件存储。

## 数据模型

```typescript
interface Product {
  id: number;           // 自增主键
  product_name: string; // 英文品名
  hs_code: string;      // HS 编码
  created_at: string;   // 创建时间
}
```

## WebSocket 消息协议

| 客户端发送 | 说明 |
|-----------|------|
| `products:list` | 获取产品列表 |
| `products:create` | 创建产品 |
| `products:update` | 更新产品 |
| `products:delete` | 删除产品 |

| 服务端返回 | 说明 |
|-----------|------|
| `products:list:result` | 产品列表结果 |
| `products:create:result` | 创建结果 |
| `products:update:result` | 更新结果 |
| `products:delete:result` | 删除结果 |
| `products:*:error` | 错误信息 |

## 文件结构

```
src/
├── app/
│   └── page.tsx           # 产品管理页面
├── lib/
│   └── ws-client.ts       # WebSocket 客户端
└── components/ui/         # shadcn/ui 组件

server/
├── server.ts              # 服务器入口
├── ws/
│   ├── index.ts           # WebSocket 路由
│   └── products.ts        # 产品处理器
└── db/
    └── sqlite.ts          # SQLite 数据库

data/
└── products.db            # SQLite 数据库文件
```

## 常用命令

### 后端
```bash
# 安装后端依赖
pnpm install

# 启动后端服务
pnpm start:backend

# 或直接运行
npx tsx server/server.ts
```

### 前端
```bash
# 开发环境
pnpm dev

# 构建生产版本
pnpm build
```

## 功能特性

- ✅ 列表展示 - 显示所有产品
- ✅ 新增产品 - 表单添加新产品
- ✅ 编辑产品 - 修改产品信息
- ✅ 删除确认 - 二次确认后删除
- ✅ 搜索筛选 - 按品名或 HS 编码搜索
- ✅ 实时连接状态 - 显示 WebSocket 连接状态
