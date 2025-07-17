# Westdale Cafe & Eatery 官方网站

欢迎来到 Westdale 咖啡店的官方网站！这是一个使用现代 Web 技术构建的响应式网站，集成了 Supabase 数据库来管理菜单和促销信息。

## 🚀 技术栈

- **前端**: HTML5, CSS3 (Tailwind CSS), JavaScript (ES6+)
- **构建工具**: Vite
- **数据库**: Supabase (PostgreSQL)
- **字体**: Google Fonts (Inter)

## 📋 功能特点

### 首页
- 咖啡店介绍和品牌故事
- 动态加载的促销信息
- 响应式设计，支持各种设备
- 联系方式和营业时间

### 菜单页
- 分类浏览 (冰饮、热饮、小食)
- 产品详细信息展示
- 价格和推荐标识
- 平滑的页面导航

### 数据管理
- Supabase 实时数据库连接
- 可通过数据库后台更新菜单和促销信息
- 支持图片 URL 和多语言显示

## 🛠️ 安装和运行

### 1. 克隆项目
```bash
git clone <your-repo-url>
cd westdale-cafe
```

### 2. 安装依赖
```bash
npm install
```

### 3. 设置 Supabase 数据库

#### 3.1 在 Supabase 控制台中执行 SQL
1. 登录你的 [Supabase 控制台](https://supabase.com)
2. 进入你的项目
3. 点击左侧菜单的 "SQL Editor"
4. 复制 `database-setup.sql` 文件中的内容并执行

#### 3.2 配置环境变量
项目中的 Supabase 配置已经设置好，如需修改请编辑 `supabase-config.js` 文件。

### 4. 启动开发服务器
```bash
npm run dev
```

网站将在 `http://localhost:3000` 启动。

### 5. 构建生产版本
```bash
npm run build
```

## 📊 数据库结构

### 表结构

#### promotions (促销信息表)
- `id`: 主键
- `title`: 促销标题
- `description`: 促销描述
- `discount_percentage`: 折扣百分比
- `start_date`: 开始日期
- `end_date`: 结束日期
- `is_active`: 是否激活

#### categories (菜单分类表)
- `id`: 主键
- `name`: 分类名称 (中文)
- `name_en`: 分类名称 (英文)
- `description`: 分类描述
- `sort_order`: 排序顺序
- `is_active`: 是否激活

#### menu_items (菜单项目表)
- `id`: 主键
- `category_id`: 分类ID (外键)
- `name`: 产品名称 (中文)
- `name_en`: 产品名称 (英文)
- `description`: 产品描述
- `price`: 价格
- `image_url`: 图片链接
- `is_available`: 是否可用
- `is_featured`: 是否推荐
- `sort_order`: 排序顺序

## 🎨 设计特点

- **温暖色调**: 使用琥珀色系营造温馨咖啡店氛围
- **现代界面**: 简洁的卡片式设计
- **响应式布局**: 完美适配桌面端和移动端
- **良好的用户体验**: 平滑的动画和交互效果

## 📱 响应式设计

网站支持以下设备:
- 桌面端 (1024px+)
- 平板端 (768px - 1023px)
- 移动端 (< 768px)

## 🔧 自定义设置

### 更新促销信息
直接在 Supabase 数据库的 `promotions` 表中添加、编辑或删除记录。

### 添加菜单项目
1. 在 `categories` 表中添加新分类 (如需要)
2. 在 `menu_items` 表中添加新产品

### 修改样式
所有样式使用 Tailwind CSS，可以在 HTML 文件中直接修改类名。

## 🌟 关于 Westdale Cafe

Westdale Cafe & Eatery 是一家位于社区中心的温馨咖啡店，我们致力于：

- 为本地社区提供高品质的咖啡和美食
- 创造温暖友好的聚会空间
- 支持本地文化和社区活动
- 用心制作每一杯饮品

## 📞 联系方式

- **地址**: Westdale 社区中心
- **电话**: (905) XXX-XXXX
- **营业时间**: 
  - 周一至周五: 7:00 - 21:00
  - 周六至周日: 8:00 - 22:00

---

*怀着真诚的服务和对咖啡的深深热爱 ❤️* 