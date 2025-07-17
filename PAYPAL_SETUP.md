# PayPal 购物车集成设置指南

## 概述

该项目已集成 PayPal 购物车功能，允许用户将商品添加到 PayPal 购物车并进行结账。

## 配置步骤

### 1. 获取 PayPal 商户 ID

1. 登录您的 [PayPal 商户账户](https://www.paypal.com/merchantapps)
2. 进入 "工具" → "所有工具" 
3. 在 "接受付款" 部分找到 "PayPal 按钮"
4. 创建新的购物车按钮时，您会看到您的商户 ID

### 2. 配置商户 ID

在 `js/shop.js` 文件中找到以下行：

```javascript
const PAYPAL_MERCHANT_ID = 'YOUR_PAYPAL_MERCHANT_ID';
```

将 `'YOUR_PAYPAL_MERCHANT_ID'` 替换为您的实际 PayPal 商户 ID。

### 3. 配置商品 ID

确保数据库中的商品有正确的 `paypal_data_id` 字段，这些 ID 应该与您在 PayPal 商户后台设置的商品 ID 匹配。

## 功能说明

### 商品展示
- 从 Supabase `products` 表加载商品信息
- 如果 `products` 表为空，自动使用 `menu_items` 表中的特色商品作为备选
- 每个商品显示：名称、价格、描述
- 自动生成 PayPal 商品 ID（格式：PROD-001, PROD-002 等）

### PayPal 集成
- 自动加载 PayPal Cart 脚本
- 为每个商品生成 `<paypal-add-to-cart-button>` 按钮
- 提供 "查看购物车" 功能
- 包含备用按钮，当 PayPal 脚本未加载时显示提示

### 页面结构
- 商品列表容器：`<div id="product-list">`
- 购物车按钮容器：`<div id="view-cart">`

## 数据库结构

### products 表
```sql
CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    price NUMERIC NOT NULL,
    paypal_data_id TEXT NOT NULL
);
```

### 示例数据
```sql
INSERT INTO products (name, price, paypal_data_id) VALUES 
('咖啡豆 - 精选混合', 25.99, 'PROD-COFFEE-001'),
('手冲咖啡套装', 45.99, 'PROD-DRIP-002'),
('拿铁杯 - 陶瓷', 18.99, 'PROD-CUP-003');
```

## 使用方法

1. 访问 `shop.html` 页面
2. 页面会自动加载商品并初始化 PayPal 功能
3. 用户可以点击 "添加到购物车" 按钮将商品添加到 PayPal 购物车
4. 点击 "查看购物车" 查看已添加的商品并进行结账

## 注意事项

- 确保 PayPal 商户账户已激活并配置正确
- 商品的 `paypal_data_id` 必须与 PayPal 后台配置的商品 ID 匹配
- 在生产环境中使用真实的 PayPal 商户 ID
- 测试时可以使用 PayPal 的沙盒环境

## 故障排除

### PayPal 脚本加载失败
- 检查网络连接
- 确认商户 ID 正确
- 查看浏览器控制台错误信息

### 商品未显示
- 检查 Supabase 连接
- 确认数据库中有商品数据
- 查看浏览器控制台日志

### 购物车按钮不工作
- 确认 PayPal 脚本已加载
- 检查商品 ID 是否正确
- 等待脚本完全初始化（可能需要几秒钟） 