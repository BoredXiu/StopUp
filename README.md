# 拼个场 (SpotUp) - 项目文档

> 年轻人的运动拼场与搭子组局平台

---

## 目录

- [1. 项目简介](#1-项目简介)
- [2. 项目架构](#2-项目架构)
- [3. 技术栈](#3-技术栈)
- [4. 功能模块](#4-功能模块)
- [5. 数据库设计](#5-数据库设计)
- [6. 后端 API 接口](#6-后端-api-接口)
- [7. 项目目录结构](#7-项目目录结构)
- [8. 环境准备](#8-环境准备)
- [9. 快速启动](#9-快速启动)
- [10. 各端详细说明](#10-各端详细说明)
- [11. 部署指南](#11-部署指南)

---

## 1. 项目简介

**拼个场 (SpotUp)** 是一个面向年轻人的运动拼场与搭子组局平台，支持 Web 端、微信小程序端和管理后台三端访问。用户可以浏览、创建、报名各类运动球局，支持 AA 分摊费用、场馆查看、信用体系等功能。

### 核心定位

- 运动拼场：篮球、足球、羽毛球、网球等各类运动组局
- 陌生人组局：找到志同道合的运动搭子
- 场馆预约：查看和选择运动场馆
- 同城约球：基于城市的本地化运动社交
- AA 分摊：灵活的多人费用分摊机制

---

## 2. 项目架构

```
┌─────────────────────────────────────────────────────────────┐
│                        用户端                                │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  Web 用户端   │  │  微信小程序   │  │  Web 管理后台  │      │
│  │  (Vue3)      │  │  (uniapp)    │  │  (Vue3)      │      │
│  │  Port: 5173  │  │              │  │  Port: 5174  │      │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘      │
│         │                 │                 │               │
│         └─────────────────┼─────────────────┘               │
│                           │                                 │
│                    ┌──────▼──────┐                          │
│                    │  Node.js API │                          │
│                    │  (Express)   │                          │
│                    │  Port: 3000  │                          │
│                    └──────┬──────┘                          │
│                           │                                 │
│                    ┌──────▼──────┐                          │
│                    │    MySQL     │                          │
│                    │  Port: 3306  │                          │
│                    └─────────────┘                          │
└─────────────────────────────────────────────────────────────┘
```

---

## 3. 技术栈

### 3.1 Web 用户端

| 技术         | 版本     | 用途      |
| ------------ | -------- | --------- |
| Vue          | ^3.3.13  | 前端框架  |
| Vite         | ^5.0.10  | 构建工具  |
| TypeScript   | ^5.3.3   | 类型安全  |
| Pinia        | ^2.1.7   | 状态管理  |
| Vue Router   | ^4.2.5   | 路由管理  |
| Element Plus | ^2.4.3   | UI 组件库 |
| Axios        | ^1.6.2   | HTTP 请求 |
| dayjs        | ^1.11.10 | 日期处理  |

### 3.2 Web 管理后台

| 技术         | 版本    | 用途       |
| ------------ | ------- | ---------- |
| Vue          | ^3.3.13 | 前端框架   |
| Vite         | ^5.0.10 | 构建工具   |
| TypeScript   | ^5.3.3  | 类型安全   |
| Pinia        | ^2.1.7  | 状态管理   |
| Vue Router   | ^4.2.5  | 路由管理   |
| Element Plus | ^2.4.3  | UI 组件库  |
| ECharts      | ^5.4.3  | 数据可视化 |
| Axios        | ^1.6.2  | HTTP 请求  |

### 3.3 微信小程序端

| 技术   | 版本    | 用途       |
| ------ | ------- | ---------- |
| uniapp | 3.0.0+  | 跨端框架   |
| Vue    | ^3.3.13 | 前端框架   |
| Pinia  | ^2.1.7  | 状态管理   |
| SCSS   | -       | 样式预处理 |

### 3.4 后端 API

| 技术               | 版本     | 用途       |
| ------------------ | -------- | ---------- |
| Node.js            | -        | 运行环境   |
| Express            | ^4.18.2  | Web 框架   |
| MySQL2             | ^3.6.5   | 数据库驱动 |
| jsonwebtoken       | ^9.0.2   | JWT 鉴权   |
| bcryptjs           | ^2.4.3   | 密码加密   |
| multer             | ^1.4.5   | 文件上传   |
| helmet             | ^7.1.0   | 安全头     |
| cors               | ^2.8.5   | 跨域处理   |
| morgan             | ^1.10.0  | 请求日志   |
| winston            | ^3.11.0  | 日志系统   |
| joi                | ^17.11.0 | 参数校验   |
| express-rate-limit | ^7.1.4   | 接口限流   |

### 3.5 数据库

| 技术  | 版本        | 用途         |
| ----- | ----------- | ------------ |
| MySQL | 5.7+ / 8.0+ | 关系型数据库 |

---

## 4. 功能模块

### 4.1 用户系统

- 微信一键登录（通过微信 openid）
- 手机号 + 密码登录
- 手机号 + 验证码注册
- JWT Token 鉴权（Access Token 7天 + Refresh Token 30天）
- 用户资料管理（昵称、头像、性别、城市、个性签名）
- 头像上传
- 常玩运动标签

### 4.2 运动拼场系统（核心）

- **创建球局**：设置运动类型、日期时间、人数上限/下限、费用模式、水平要求、性别要求、场馆选择、描述
- **报名球局**：用户报名参加球局，自动扣减名额
- **退出球局**：用户退出已报名的球局
- **取消球局**：创建者取消球局
- **成员列表**：查看球局参与者信息及信用分

#### 球局状态流转

```
报名中(1) ──→ 已满员(2) ──→ 已开始(3) ──→ 已结束(4)
    │                                        │
    └──────────── 已取消(5) ←─────────────────┘
```

#### 费用模式

| 模式         | 说明                   |
| ------------ | ---------------------- |
| AA 制 (1)    | 总费用由所有参与者均摊 |
| 固定费用 (2) | 每人固定金额           |
| 免费 (3)     | 无需支付费用           |

### 4.3 场馆系统

- 场馆列表（支持搜索、分页）
- 场馆详情（图片、地址、电话、营业时间、设施服务）
- 地图定位（经纬度坐标）
- 热门场馆推荐
- 场馆关联球局展示

### 4.4 支付系统

- 微信支付集成
- 支付订单生成
- 支付回调处理（幂等设计）
- 超时自动取消（30分钟未支付）
- 人数不足自动退款

### 4.5 订单系统

#### 订单状态

| 状态       | 说明                 |
| ---------- | -------------------- |
| 待支付 (1) | 订单已创建，等待支付 |
| 已支付 (2) | 支付成功             |
| 已取消 (3) | 订单已取消           |
| 已完成 (4) | 球局完成，订单完结   |
| 已退款 (5) | 已退款               |

### 4.6 搭子社交系统

- 关注/取消关注用户
- 收藏球局
- 用户主页
- 常一起运动的人推荐
- 邀请好友参加球局

### 4.7 消息通知系统

- 系统通知推送
- 报名成功通知
- 球局取消通知
- 支付成功通知
- 通知已读/未读状态
- 一键全部已读

### 4.8 信用系统

#### 信用规则

| 行为                 | 分值变化 |
| -------------------- | -------- |
| 参加球局             | +2 分    |
| 完成球局             | +5 分    |
| 放鸽子（报名未到场） | -20 分   |
| 举报成立（被举报）   | -10 分   |

- 信用分满分 100 分
- 信用分低于 60 分将无法报名球局
- 完整的信用记录追踪

### 4.9 举报系统

- 用户举报（放鸽子、违规内容、恶意用户）
- 管理员审核举报
- 举报通过 → 扣除被举报人信用分
- 举报驳回 → 不做处理

### 4.10 管理后台

- **数据概览**：用户总数、球局总数、营收总额、待审举报数
- **ECharts 图表**：运动类型分布饼图、近7天球局趋势折线图
- **用户管理**：列表查询、启用/禁用用户
- **球局管理**：列表查询、取消球局、结束球局
- **场馆管理**：CRUD 操作、热门推荐设置
- **订单管理**：订单列表查询
- **举报审核**：审核通过/驳回举报

---

## 5. 数据库设计

### 5.1 数据库信息

- 数据库名：`spotup`
- 字符集：`utf8mb4`
- 排序规则：`utf8mb4_unicode_ci`

### 5.2 数据表清单

| 表名               | 说明           | 核心字段                                                   |
| ------------------ | -------------- | ---------------------------------------------------------- |
| `users`            | 用户表         | openid, phone, nickname, credit_score, status              |
| `sports`           | 运动类型表     | name, icon, sort_order                                     |
| `user_sport_tags`  | 用户运动标签表 | user_id, sport_id, level                                   |
| `venues`           | 场馆表         | name, address, city, latitude, longitude, rating           |
| `venue_images`     | 场馆图片表     | venue_id, url, sort_order                                  |
| `matches`          | 球局表         | title, sport_id, venue_id, creator_id, status, max_players |
| `match_members`    | 球局成员表     | match_id, user_id, role, status                            |
| `orders`           | 订单表         | order_no, match_id, user_id, amount, status                |
| `payments`         | 支付记录表     | order_id, transaction_id, amount, status                   |
| `notifications`    | 通知表         | user_id, type, title, content, is_read                     |
| `reports`          | 举报表         | reporter_id, reported_id, reason, status                   |
| `credit_logs`      | 信用记录表     | user_id, change_amount, reason                             |
| `follows`          | 关注表         | follower_id, followed_id                                   |
| `match_favorites`  | 球局收藏表     | user_id, match_id                                          |
| `admins`           | 管理员表       | username, password, role                                   |
| `venue_facilities` | 场馆设施表     | venue_id, name                                             |

### 5.3 索引设计

所有表均设计了合理的索引，包括：

- 主键索引
- 唯一索引（openid, phone, order_no 等）
- 普通索引（city, status, created_at 等高频查询字段）
- 复合索引（latitude + longitude 地理位置查询）

---

## 6. 后端 API 接口

### 6.1 接口规范

- 基础路径：`/api`
- 请求格式：`application/json`
- 鉴权方式：`Bearer Token`（Header: `Authorization: Bearer <token>`）
- 统一返回格式：

```json
{
  "code": 200,
  "message": "success",
  "data": { ... }
}
```

### 6.2 接口列表

#### 认证模块 `/api/auth`

| 方法 | 路径                      | 说明            | 鉴权 |
| ---- | ------------------------- | --------------- | ---- |
| POST | `/api/auth/wechat-login`  | 微信登录        | 否   |
| POST | `/api/auth/phone-login`   | 手机号登录/注册 | 否   |
| POST | `/api/auth/send-sms`      | 发送短信验证码  | 否   |
| POST | `/api/auth/refresh-token` | 刷新 Token      | 是   |

#### 用户模块 `/api/users`

| 方法   | 路径                     | 说明         | 鉴权 |
| ------ | ------------------------ | ------------ | ---- |
| GET    | `/api/users/profile`     | 获取个人信息 | 是   |
| PUT    | `/api/users/profile`     | 更新个人信息 | 是   |
| GET    | `/api/users/credit-logs` | 获取信用记录 | 是   |
| GET    | `/api/users/:id`         | 查看用户主页 | 否   |
| POST   | `/api/users/:id/follow`  | 关注用户     | 是   |
| DELETE | `/api/users/:id/follow`  | 取消关注     | 是   |

#### 球局模块 `/api/matches`

| 方法 | 路径                        | 说明                 | 鉴权 |
| ---- | --------------------------- | -------------------- | ---- |
| GET  | `/api/matches`              | 球局列表（支持筛选） | 否   |
| GET  | `/api/matches/my`           | 我的球局             | 是   |
| GET  | `/api/matches/:id`          | 球局详情             | 否   |
| POST | `/api/matches`              | 创建球局             | 是   |
| POST | `/api/matches/:id/join`     | 报名球局             | 是   |
| POST | `/api/matches/:id/leave`    | 退出球局             | 是   |
| POST | `/api/matches/:id/cancel`   | 取消球局             | 是   |
| POST | `/api/matches/:id/favorite` | 收藏球局             | 是   |

#### 场馆模块 `/api/venues`

| 方法 | 路径              | 说明     | 鉴权 |
| ---- | ----------------- | -------- | ---- |
| GET  | `/api/venues`     | 场馆列表 | 否   |
| GET  | `/api/venues/:id` | 场馆详情 | 否   |

#### 订单模块 `/api/orders`

| 方法 | 路径                     | 说明     | 鉴权 |
| ---- | ------------------------ | -------- | ---- |
| GET  | `/api/orders/my`         | 我的订单 | 是   |
| POST | `/api/orders/:id/pay`    | 支付订单 | 是   |
| POST | `/api/orders/:id/refund` | 申请退款 | 是   |

#### 支付模块 `/api/payments`

| 方法 | 路径                          | 说明         | 鉴权 |
| ---- | ----------------------------- | ------------ | ---- |
| POST | `/api/payments/wechat-notify` | 微信支付回调 | 否   |

#### 通知模块 `/api/notifications`

| 方法 | 路径                              | 说明     | 鉴权 |
| ---- | --------------------------------- | -------- | ---- |
| GET  | `/api/notifications`              | 通知列表 | 是   |
| GET  | `/api/notifications/unread-count` | 未读数量 | 是   |
| PUT  | `/api/notifications/:id/read`     | 标记已读 | 是   |
| PUT  | `/api/notifications/read-all`     | 全部已读 | 是   |

#### 举报模块 `/api/reports`

| 方法 | 路径              | 说明     | 鉴权 |
| ---- | ----------------- | -------- | ---- |
| POST | `/api/reports`    | 提交举报 | 是   |
| GET  | `/api/reports/my` | 我的举报 | 是   |

#### 运动类型 `/api/sports`

| 方法 | 路径          | 说明             | 鉴权 |
| ---- | ------------- | ---------------- | ---- |
| GET  | `/api/sports` | 获取所有运动类型 | 否   |

#### 文件上传 `/api/upload`

| 方法 | 路径                | 说明     | 鉴权 |
| ---- | ------------------- | -------- | ---- |
| POST | `/api/upload/image` | 上传图片 | 是   |

#### 管理后台 `/api/admin`

| 方法 | 路径                            | 说明         | 鉴权      |
| ---- | ------------------------------- | ------------ | --------- |
| POST | `/api/admin/login`              | 管理员登录   | 否        |
| GET  | `/api/admin/dashboard`          | 数据概览     | 是(Admin) |
| GET  | `/api/admin/users`              | 用户管理列表 | 是(Admin) |
| PUT  | `/api/admin/users/:id/status`   | 修改用户状态 | 是(Admin) |
| GET  | `/api/admin/matches`            | 球局管理列表 | 是(Admin) |
| PUT  | `/api/admin/matches/:id/status` | 修改球局状态 | 是(Admin) |
| GET  | `/api/admin/venues`             | 场馆管理列表 | 是(Admin) |
| POST | `/api/admin/venues`             | 新增场馆     | 是(Admin) |
| PUT  | `/api/admin/venues/:id`         | 更新场馆     | 是(Admin) |
| GET  | `/api/admin/orders`             | 订单管理列表 | 是(Admin) |
| GET  | `/api/admin/reports`            | 举报管理列表 | 是(Admin) |
| PUT  | `/api/admin/reports/:id/handle` | 处理举报     | 是(Admin) |

---

## 7. 项目目录结构

```
SpotUp/
├── database/                        # 数据库
│   └── schema.sql                   # MySQL 建表脚本
│
├── server/                          # Node.js 后端 API
│   ├── .env                         # 环境变量配置
│   ├── package.json
│   ├── uploads/                     # 文件上传目录
│   └── src/
│       ├── app.js                   # 应用入口
│       ├── config/                  # 配置
│       │   ├── index.js
│       │   └── database.js
│       ├── controllers/             # 控制器层
│       │   ├── AdminController.js
│       │   ├── AuthController.js
│       │   ├── MatchController.js
│       │   ├── NotificationController.js
│       │   ├── OrderController.js
│       │   ├── ReportController.js
│       │   ├── SportController.js
│       │   ├── UploadController.js
│       │   ├── UserController.js
│       │   └── VenueController.js
│       ├── middlewares/             # 中间件
│       │   ├── auth.js              # JWT 鉴权
│       │   ├── errorHandler.js      # 错误处理
│       │   └── validate.js          # 参数校验
│       ├── models/                  # 数据模型层
│       │   ├── CreditLog.js
│       │   ├── Follow.js
│       │   ├── Match.js
│       │   ├── Notification.js
│       │   ├── Order.js
│       │   ├── Payment.js
│       │   ├── Report.js
│       │   ├── Sport.js
│       │   ├── User.js
│       │   └── Venue.js
│       ├── routes/                  # 路由定义
│       │   ├── admin.js
│       │   ├── auth.js
│       │   ├── matches.js
│       │   ├── notifications.js
│       │   ├── orders.js
│       │   ├── payments.js
│       │   ├── reports.js
│       │   ├── sports.js
│       │   ├── upload.js
│       │   ├── users.js
│       │   └── venues.js
│       ├── services/                # 业务逻辑层
│       │   ├── AuthService.js
│       │   ├── MatchService.js
│       │   ├── OrderService.js
│       │   └── ReportService.js
│       └── utils/                   # 工具函数
│           ├── errors.js
│           ├── helpers.js
│           └── response.js
│
├── web-client/                      # Web 用户端
│   ├── index.html
│   ├── package.json
│   ├── vite.config.ts
│   ├── tsconfig.json
│   └── src/
│       ├── main.ts                  # 入口文件
│       ├── App.vue                  # 根组件
│       ├── api/                     # API 服务层
│       │   ├── index.ts
│       │   └── request.ts
│       ├── components/              # 公共组件
│       │   ├── AppHeader.vue        # 顶部导航
│       │   ├── AppFooter.vue        # 底部信息
│       │   └── MatchCard.vue        # 球局卡片
│       ├── layouts/                 # 布局组件
│       │   └── DefaultLayout.vue
│       ├── router/                  # 路由配置
│       │   └── index.ts
│       ├── store/                   # Pinia 状态管理
│       │   ├── user.ts
│       │   └── notification.ts
│       ├── styles/                  # 全局样式
│       │   └── global.scss
│       ├── types/                   # TypeScript 类型
│       │   └── index.ts
│       ├── utils/                   # 工具函数
│       │   └── format.ts
│       └── views/                   # 页面组件
│           ├── Home.vue             # 首页
│           ├── Login.vue            # 登录/注册
│           ├── MatchDetail.vue      # 球局详情
│           ├── Search.vue           # 搜索页
│           ├── Venues.vue           # 场馆列表
│           ├── VenueDetail.vue      # 场馆详情
│           ├── NotFound.vue         # 404 页面
│           └── user/                # 用户中心
│               ├── Profile.vue      # 个人资料
│               ├── MyMatches.vue    # 我的球局
│               ├── MyOrders.vue     # 我的订单
│               ├── CreateMatch.vue  # 创建球局
│               ├── Credit.vue       # 信用记录
│               └── Notifications.vue # 消息通知
│
├── admin/                           # Web 管理后台
│   ├── index.html
│   ├── package.json
│   ├── vite.config.ts
│   └── src/
│       ├── main.ts                  # 入口文件
│       ├── App.vue                  # 根组件
│       ├── api/
│       │   └── index.ts             # API 服务层
│       ├── layouts/
│       │   └── AdminLayout.vue      # 管理后台布局
│       ├── router/
│       │   └── index.ts             # 路由 + RBAC 守卫
│       ├── styles/
│       │   └── global.scss
│       └── views/
│           ├── Login.vue            # 管理员登录
│           ├── Dashboard.vue        # 数据概览（ECharts）
│           ├── Users.vue            # 用户管理
│           ├── Matches.vue          # 球局管理
│           ├── Venues.vue           # 场馆管理
│           ├── Orders.vue           # 订单管理
│           └── Reports.vue          # 举报审核
│
└── uniapp/                           # 微信小程序
    ├── manifest.json
    ├── pages.json                   # 页面配置 + TabBar
    ├── uni.scss                     # 全局样式变量
    ├── index.html                   # HTML 入口
    ├── main.js                      # 入口文件
    ├── App.vue                      # 根组件
    ├── uni.promisify.adaptor.js     # Promise 适配器
    ├── api/
    │   └── index.js                 # API 服务层
    ├── store/
    │   └── user.js                  # 用户状态管理
    ├── static/
    │   └── tabbar/                  # TabBar 图标
    └── pages/
        ├── index/
        │   └── index.vue            # 首页
        ├── login/
        │   └── index.vue            # 登录/注册
        ├── match/
        │   ├── detail.vue           # 球局详情
        │   └── create.vue           # 创建球局
        ├── venue/
        │   ├── list.vue             # 场馆列表
        │   └── detail.vue           # 场馆详情
        └── user/
            ├── profile.vue          # 个人中心
            ├── matches.vue          # 我的球局
            ├── orders.vue           # 我的订单
            ├── credit.vue           # 信用记录
            └── notifications.vue    # 消息通知
```

---

## 8. 环境准备

### 8.1 必需环境

| 软件              | 最低版本 | 说明                |
| ----------------- | -------- | ------------------- |
| Node.js           | 16.x+    | JavaScript 运行环境 |
| MySQL             | 5.7+     | 关系型数据库        |
| npm / yarn / pnpm | -        | 包管理器            |

### 8.2 推荐工具

| 工具              | 用途              |
| ----------------- | ----------------- |
| VS Code           | 代码编辑器        |
| HBuilder X        | uniapp 小程序开发 |
| 微信开发者工具    | 微信小程序调试    |
| Postman / Apifox  | API 接口调试      |
| Navicat / DBeaver | 数据库管理        |

---

## 9. 快速启动

### 9.1 克隆项目

```bash
git clone <仓库地址>
cd SpotUp
```

### 9.2 初始化数据库

1. 确保 MySQL 服务已启动
2. 使用 MySQL 客户端执行建表脚本：

```bash
mysql -u root -p < database/schema.sql
```

3. 导入种子数据（填充测试数据）：

```bash
mysql -u root -p < database/seed.sql
```

> 也可以使用 Navicat/DBeaver 等工具导入 `database/schema.sql` 和 `database/seed.sql` 文件。

#### 管理员账号

| 项目     | 值                       |
| -------- | ------------------------ |
| 用户名   | `admin`                  |
| 密码     | `admin123`               |
| 角色     | 超级管理员 (super_admin) |
| 登录地址 | http://localhost:5174    |

> 密码使用 bcrypt 加密存储，可在 `database/seed.sql` 中查看或修改。

#### 测试用户账号

所有种子数据中的用户密码均为 `123456`，可使用任意手机号（如 `13800001001`）登录 Web 端。

### 9.3 启动后端服务

```bash
# 进入后端目录
cd server

# 安装依赖
npm install

# 配置环境变量（编辑 .env 文件）
# 主要修改数据库连接信息和 JWT 密钥

# 启动开发服务器（使用 nodemon 热重载）
npm run dev

# 或直接启动
npm start
```

后端服务默认运行在 `http://localhost:3000`。

#### .env 配置说明

```env
# 服务端口
PORT=3000

# 数据库配置（必填）
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password        # 修改为你的 MySQL 密码
DB_NAME=ai_spotup

# JWT 配置（生产环境务必修改密钥）
JWT_SECRET=spotup_jwt_secret_key_change_in_production
JWT_EXPIRES_IN=7d
JWT_REFRESH_EXPIRES_IN=30d

# 微信配置（小程序和支付需要）
WECHAT_APPID=your_wechat_appid
WECHAT_SECRET=your_wechat_secret
WECHAT_MCHID=your_wechat_mchid
WECHAT_API_KEY=your_wechat_api_key

# 文件上传
UPLOAD_DIR=uploads
MAX_FILE_SIZE=5242880              # 5MB

# 日志级别
LOG_LEVEL=debug

# 前端地址（CORS 白名单）
CORS_ORIGIN=http://localhost:5173
```

### 9.4 启动 Web 用户端

```bash
# 进入 Web 用户端目录
cd web-client

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

Web 用户端默认运行在 `http://localhost:5173`。

开发服务器已配置代理，`/api` 和 `/uploads` 请求会自动转发到后端 `http://localhost:3000`。

### 9.5 启动 Web 管理后台

```bash
# 进入管理后台目录
cd admin

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

管理后台默认运行在 `http://localhost:5174`。

### 9.6 启动微信小程序

> 使用 **HBuilder X** 打开 `uniapp` 目录，点击「运行 → 运行到小程序模拟器 → 微信开发者工具」即可启动小程序。

1. 打开 HBuilder X
2. 文件 → 导入 → 从本地目录导入 → 选择 `uniapp` 目录
3. 运行 → 运行到小程序模拟器 → 微信开发者工具

4. 打开 **HBuilder X**，导入 `uniapp` 目录
5. 运行 → 运行到小程序模拟器 → 微信开发者工具

### 9.7 验证服务

启动所有服务后，验证各端是否正常运行：

| 服务       | 地址                             | 验证方式                                       |
| ---------- | -------------------------------- | ---------------------------------------------- |
| 后端 API   | http://localhost:3000/api/health | 浏览器访问，返回 `{"code":200,"message":"ok"}` |
| Web 用户端 | http://localhost:5173            | 浏览器访问首页                                 |
| 管理后台   | http://localhost:5174            | 浏览器访问登录页                               |
| 小程序     | 微信开发者工具                   | 预览小程序首页                                 |

---

## 10. 各端详细说明

### 10.1 Web 用户端

#### 页面路由

| 路由                  | 页面      | 说明                         | 需要登录 |
| --------------------- | --------- | ---------------------------- | -------- |
| `/`                   | 首页      | 精选球局、搜索、热门场馆     | 否       |
| `/matches/:id`        | 球局详情  | 球局信息、成员列表、报名操作 | 否       |
| `/venues`             | 场馆列表  | 场馆搜索和浏览               | 否       |
| `/venues/:id`         | 场馆详情  | 场馆信息、设施、近期球局     | 否       |
| `/search`             | 搜索页    | 多条件筛选球局               | 否       |
| `/login`              | 登录/注册 | 手机号登录、注册             | 否       |
| `/user/profile`       | 个人中心  | 资料编辑、快捷入口           | 是       |
| `/user/matches`       | 我的球局  | 按状态筛选                   | 是       |
| `/user/orders`        | 我的订单  | 支付、退款操作               | 是       |
| `/user/create-match`  | 创建球局  | 完整表单                     | 是       |
| `/user/notifications` | 消息通知  | 已读/未读、全部已读          | 是       |
| `/user/credit`        | 信用记录  | 信用分、规则、记录           | 是       |

#### 构建部署

```bash
cd web-client
npm run build
```

构建产物在 `web-client/dist/` 目录，部署到任意静态文件服务器（Nginx、Apache 等）。

### 10.2 Web 管理后台

#### 页面路由

| 路由       | 页面       | 说明                    |
| ---------- | ---------- | ----------------------- |
| `/login`   | 管理员登录 | 用户名 + 密码           |
| `/`        | 数据概览   | 统计卡片 + ECharts 图表 |
| `/users`   | 用户管理   | 列表、搜索、启用/禁用   |
| `/matches` | 球局管理   | 列表、取消、结束        |
| `/venues`  | 场馆管理   | CRUD、热门推荐          |
| `/orders`  | 订单管理   | 列表查询                |
| `/reports` | 举报审核   | 通过/驳回               |

#### RBAC 权限

- 路由守卫：未登录自动跳转登录页
- Token 存储：`localStorage` 中的 `admin_token`
- 接口鉴权：所有管理后台 API 需要 Admin 角色 JWT

#### 构建部署

```bash
cd admin
npm run build
```

构建产物在 `admin/dist/` 目录。

### 10.3 微信小程序

#### 页面配置

小程序包含 3 个 TabBar 页面：

| Tab  | 页面                 | 说明                     |
| ---- | -------------------- | ------------------------ |
| 首页 | `pages/index/index`  | 精选球局、搜索、热门场馆 |
| 场馆 | `pages/venue/list`   | 场馆列表                 |
| 我的 | `pages/user/profile` | 个人中心                 |

#### 其他页面

| 页面路径                   | 说明      |
| -------------------------- | --------- |
| `pages/match/detail`       | 球局详情  |
| `pages/match/create`       | 创建球局  |
| `pages/venue/detail`       | 场馆详情  |
| `pages/user/matches`       | 我的球局  |
| `pages/user/orders`        | 我的订单  |
| `pages/user/credit`        | 信用记录  |
| `pages/user/notifications` | 消息通知  |
| `pages/login/index`        | 登录/注册 |

#### 构建部署

````bash
cd uniapp

使用 **HBuilder X** 打开 `uniapp` 目录，点击「运行 → 运行到小程序模拟器 → 微信开发者工具」即可预览。

生产构建同样在 HBuilder X 中点击「发行 → 小程序-微信」，构建产物在 `unpackage/dist/build/mp-weixin/`，使用微信开发者工具上传代码。

### 10.4 后端 API

#### 中间件说明

| 中间件               | 说明                        |
| -------------------- | --------------------------- |
| `helmet`             | 安全 HTTP 头                |
| `cors`               | 跨域请求处理                |
| `express.json`       | JSON 请求体解析             |
| `morgan`             | HTTP 请求日志               |
| `express-rate-limit` | API 全局限流（15分钟500次） |
| `auth`               | JWT Token 鉴权              |
| `errorHandler`       | 统一错误处理                |
| `validate`           | Joi 参数校验                |

#### 构建部署

```bash
cd server

# 生产环境启动
NODE_ENV=production npm start

# 推荐使用 PM2 管理进程
npm install -g pm2
pm2 start src/app.js --name spotup-api
````

---

## 11. 部署指南

### 11.1 生产环境检查清单

- [ ] 修改 `.env` 中 `JWT_SECRET` 为复杂随机字符串
- [ ] 修改 `.env` 中数据库密码
- [ ] 配置正确的微信 AppID、Secret、商户号
- [ ] 设置 `CORS_ORIGIN` 为实际前端域名
- [ ] 设置 `LOG_LEVEL=info`（减少日志输出）
- [ ] 配置 HTTPS 证书
- [ ] 配置 Nginx 反向代理
- [ ] 配置 MySQL 数据库备份策略

### 11.2 Nginx 配置示例

```nginx
server {
    listen 80;
    server_name spotup.com www.spotup.com;

    # Web 用户端
    location / {
        root /var/www/spotup/web-client/dist;
        index index.html;
        try_files $uri $uri/ /index.html;
    }

    # 管理后台
    location /admin {
        alias /var/www/spotup/admin/dist;
        index index.html;
        try_files $uri $uri/ /admin/index.html;
    }

    # API 反向代理
    location /api {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    # 上传文件
    location /uploads {
        proxy_pass http://127.0.0.1:3000;
    }
}
```

### 11.3 PM2 进程管理

```bash
# 安装 PM2
npm install -g pm2

# 启动后端
pm2 start server/src/app.js --name spotup-api

# 查看状态
pm2 status

# 查看日志
pm2 logs spotup-api

# 设置开机自启
pm2 startup
pm2 save
```

### 11.4 数据库备份

```bash
# 定时备份脚本（crontab）
mysqldump -u root -p spotup > /backup/spotup_$(date +%Y%m%d).sql
```

---

## 附录

### A. 常见问题

**Q: 启动后端报数据库连接失败？**

A: 检查 `.env` 文件中数据库配置是否正确，确保 MySQL 服务已启动，数据库 `spotup` 已创建。

**Q: Web 端请求 API 报 404？**

A: 确保后端服务已启动在 3000 端口，Vite 代理配置正确。

**Q: 小程序无法请求 API？**

A: 小程序需要在微信公众平台配置服务器域名白名单，开发阶段可在开发者工具中关闭域名校验。

**Q: 文件上传失败？**

A: 检查 `server/uploads/` 目录是否存在且有写入权限，文件大小是否超过 5MB 限制。

### B. 开发规范

- 使用 ESLint + Prettier 统一代码风格
- 组件使用 `<script setup>` + Composition API
- TypeScript 类型定义完整
- API 接口遵循 RESTful 规范
- Git 提交使用语义化 Commit Message

### C. 版本信息

| 模块         | 版本   |
| ------------ | ------ |
| 拼个场整体   | v1.0.0 |
| 后端 API     | v1.0.0 |
| Web 用户端   | v1.0.0 |
| Web 管理后台 | v1.0.0 |
| 微信小程序   | v1.0.0 |
