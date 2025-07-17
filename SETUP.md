# 🚀 Westdale Cafe 网站快速设置指南

## 📋 设置步骤

### 1. 首先运行网站
```bash
npm run dev
```
网站将在 http://localhost:3000 启动

### 2. 设置 Supabase 数据库

**重要**: 由于权限限制，需要手动在 Supabase 控制台中设置数据库

#### 步骤：
1. 访问 [Supabase 控制台](https://supabase.com)
2. 登录并进入你的项目
3. 点击左侧菜单的 **"SQL Editor"**
4. 复制 `database-setup.sql` 文件中的完整内容
5. 粘贴到 SQL 编辑器中并点击 **"Run"** 执行

#### 或者分步执行：

**第一步 - 创建表格：**
```sql
-- 创建促销信息表
CREATE TABLE promotions (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    discount_percentage INTEGER,
    start_date DATE,
    end_date DATE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 创建菜单分类表  
CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    name_en VARCHAR(100),
    description TEXT,
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 创建菜单项目表
CREATE TABLE menu_items (
    id SERIAL PRIMARY KEY,
    category_id INTEGER REFERENCES categories(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    name_en VARCHAR(255),
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    image_url TEXT,
    is_available BOOLEAN DEFAULT true,
    is_featured BOOLEAN DEFAULT false,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

**第二步 - 插入示例数据：**
```sql
-- 插入菜单分类
INSERT INTO categories (name, name_en, description, sort_order) VALUES
('冰饮', 'Cold Drinks', '清爽的冰饮系列，包括冰咖啡、茶饮等', 1),
('热饮', 'Hot Drinks', '温暖的热饮系列，包括咖啡、茶拿铁等', 2),
('小食', 'Snacks', '精致的小食和点心，新鲜烘焙', 3);

-- 插入菜单项目
INSERT INTO menu_items (category_id, name, name_en, description, price, is_featured, sort_order) VALUES
(1, '冰拿铁', 'Iced Latte', '香醇的意式浓缩咖啡搭配冰爽牛奶，完美的冰凉享受', 32.00, true, 1),
(2, '抹茶拿铁', 'Matcha Latte', '精选日本抹茶粉制作，浓郁的抹茶香味与丝滑牛奶完美融合', 36.00, true, 1),
(3, '新鲜烘焙贝果', 'Fresh Baked Bagel', '每日新鲜烘焙的贝果，可搭配奶油芝士、黄油或果酱', 25.00, false, 1);

-- 插入促销信息
INSERT INTO promotions (title, description, discount_percentage, start_date, end_date, is_active) VALUES
('新店开业优惠', '庆祝 Westdale 咖啡店盛大开业！所有饮品享受8折优惠，欢迎品尝我们精心制作的每一杯咖啡', 20, CURRENT_DATE, CURRENT_DATE + INTERVAL '30 days', true),
('学生优惠', '出示有效学生证即可享受所有饮品9折优惠，支持学子们的学习生活', 10, CURRENT_DATE, CURRENT_DATE + INTERVAL '365 days', true);
```

### 3. 验证设置
设置完数据库后：
1. 刷新网站 (http://localhost:3000)
2. 首页应该显示促销信息
3. 菜单页面应该显示三个分类和示例产品

## ✅ 成功指标
- ✅ 网站正常运行在 localhost:3000
- ✅ 首页显示两个促销活动
- ✅ 菜单页显示：冰饮、热饮、小食三个分类
- ✅ 每个分类下有一个示例产品

## 🔧 后续管理
数据库设置完成后，你可以：
- 通过 Supabase 控制台的 "Table Editor" 管理数据
- 添加、编辑、删除促销信息和菜单项目
- 网站会自动同步显示更新的内容

## 🎯 项目特点
- **响应式设计**: 支持手机、平板、桌面
- **实时数据**: Supabase 集成，数据即时更新
- **美观界面**: 温暖的琥珀色主题
- **易于管理**: 通过数据库后台轻松更新内容 