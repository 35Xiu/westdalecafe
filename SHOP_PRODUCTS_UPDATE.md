# 📦 Westdale Cafe 商品数据库更新指南

## 问题说明

您提到的 "Westdale Cafe Mug222" 商品没有显示 PayPal 添加到购物车按钮，这是因为：

1. 数据库中没有 `products` 表和相应的商品数据
2. 系统之前只从 `menu_items` 表（饮品菜单）获取数据，没有实体商品
3. 需要创建专门的商品表来支持电商功能

## 🚀 快速解决方案

### 步骤 1：更新数据库

在您的 Supabase 控制台中执行以下 SQL 语句来添加商品数据：

```sql
-- 创建商品表
CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    paypal_data_id VARCHAR(100) NOT NULL UNIQUE,
    image_url TEXT,
    is_available BOOLEAN DEFAULT true,
    is_featured BOOLEAN DEFAULT false,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 插入商品数据（包含 Westdale Cafe Mug222）
INSERT INTO products (name, description, price, paypal_data_id, image_url, is_featured, sort_order) VALUES
('Westdale Cafe Mug222', 'Premium ceramic mug with Westdale Cafe logo. Perfect for your daily coffee rituals at home.', 15.99, 'X2VFVALCA64RE', 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=400&h=400&fit=crop', true, 1),
('Westdale Blend Coffee Beans', 'Our signature house blend coffee beans, roasted to perfection. 340g bag of premium Arabica beans.', 24.99, 'PROD-002', 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=400&h=400&fit=crop', true, 2),
('Westdale Travel Tumbler', 'Double-walled stainless steel travel tumbler with Westdale logo. Keeps drinks hot for 6 hours.', 28.99, 'PROD-003', 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=400&fit=crop', true, 3),
('Vintage Coffee Grinder', 'Manual coffee grinder with adjustable settings. Perfect for fresh ground coffee at home.', 45.99, 'PROD-004', 'https://images.unsplash.com/photo-1609081219090-a6d81d3085bf?w=400&h=400&fit=crop', false, 4),
('Westdale Coffee Gift Set', 'Complete gift set including mug, coffee beans, and brewing guide. Perfect for coffee lovers.', 39.99, 'PROD-005', 'https://images.unsplash.com/photo-1511920170033-f8396924c348?w=400&h=400&fit=crop', true, 5),
('Artisan Espresso Cups Set', 'Set of 2 handcrafted ceramic espresso cups with matching saucers. Elegant and durable.', 22.99, 'PROD-006', 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400&h=400&fit=crop', false, 6);

-- 创建索引优化查询性能
CREATE INDEX IF NOT EXISTS idx_products_available ON products(is_available);
CREATE INDEX IF NOT EXISTS idx_products_featured ON products(is_featured);
CREATE INDEX IF NOT EXISTS idx_products_sort ON products(sort_order);
CREATE INDEX IF NOT EXISTS idx_products_paypal_id ON products(paypal_data_id);
```

### 步骤 2：验证更新

执行完上述 SQL 后，您可以在 Supabase 的 Table Editor 中查看新创建的 `products` 表，应该看到 6 个商品，包括：

- ✅ **Westdale Cafe Mug222** (PayPal ID: `X2VFVALCA64RE`)
- ✅ Westdale Blend Coffee Beans
- ✅ Westdale Travel Tumbler  
- ✅ Vintage Coffee Grinder
- ✅ Westdale Coffee Gift Set
- ✅ Artisan Espresso Cups Set

### 步骤 3：测试功能

1. 刷新您的网站 (`http://localhost:8000`)
2. 访问 Shop 页面 (`http://localhost:8000/shop.html`)
3. 您应该看到：
   - ✅ 6 个商品卡片，每个都有图片、名称、描述、价格
   - ✅ 每个商品都有 PayPal "Add to Cart" 按钮
   - ✅ 导航栏有 PayPal "View Cart" 按钮
   - ✅ Westdale Cafe Mug222 应该排在第一位（因为 `sort_order` 是 1）

## 🔧 技术详情

### PayPal 集成配置

- **Merchant ID**: `QPA76K82XS4TQ`
- **Westdale Cafe Mug222 的 PayPal ID**: `X2VFVALCA64RE`
- **其他商品的 PayPal ID**: `PROD-002` 到 `PROD-006`

### 系统工作流程

1. **数据获取**: `js/supabase-client.js` 的 `getProducts()` 函数从 `products` 表获取数据
2. **商品渲染**: `js/shop.js` 的 `renderProducts()` 函数生成商品卡片和 PayPal 按钮
3. **PayPal 初始化**: 每个商品的 PayPal 按钮使用各自的 `paypal_data_id` 进行初始化
4. **购物车功能**: 导航栏的查看购物车按钮统一使用 `pp-view-cart` ID

## 🎯 预期结果

更新完成后，您应该看到：

```
Westdale Cafe Mug222        $15.99    [PayPal Add to Cart]
Westdale Blend Coffee Beans $24.99    [PayPal Add to Cart]  
Westdale Travel Tumbler     $28.99    [PayPal Add to Cart]
... (更多商品)
```

每个 PayPal 按钮都应该正常工作，允许用户添加商品到购物车并进行结账。

## 🚨 故障排除

如果仍然没有看到 PayPal 按钮：

1. **检查浏览器控制台** 是否有 JavaScript 错误
2. **验证 Supabase 连接** 确保数据库查询成功
3. **检查 PayPal 脚本加载** 确保 PayPal 脚本正确加载
4. **清除浏览器缓存** 强制刷新页面

## 📞 支持

如果您在执行这些步骤时遇到问题，请检查：
- Supabase 项目连接是否正常
- SQL 语句是否完全执行成功
- 浏览器开发者工具中的网络和控制台选项卡是否有错误信息 