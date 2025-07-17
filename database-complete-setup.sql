-- Westdale Cafe 完整数据库初始化脚本
-- 在 Supabase SQL 编辑器中运行此脚本来创建完整的数据库结构和初始数据
-- 这个脚本整合了所有必要的表和数据，替代之前的分散脚本
-- 版本 3.0: 真实菜品数据，支持差异化价格的杯型选项

-- =============================================
-- 1. 创建表结构
-- =============================================

-- 创建菜单分类表
CREATE TABLE IF NOT EXISTS categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    name_fr VARCHAR(100), -- 法文名称
    description TEXT,
    image_url TEXT, -- 分类图片链接
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 创建菜单项目表 (支持差异化价格的杯型选项)
CREATE TABLE IF NOT EXISTS menu_items (
    id SERIAL PRIMARY KEY,
    category_id INTEGER REFERENCES categories(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    name_fr VARCHAR(255), -- 法文名称
    description TEXT,
    price DECIMAL(10,2) NOT NULL, -- 基础价格或最小价格
    size_options JSONB DEFAULT '{"sizes": [], "uniform_price": true}', -- 杯型选项配置
    notes TEXT, -- 特殊说明
    image_url TEXT,
    is_available BOOLEAN DEFAULT true,
    is_featured BOOLEAN DEFAULT false,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 为已存在的menu_items表添加新列（如果还没有）
DO $$
BEGIN
    -- 添加法文名称列
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'menu_items' AND column_name = 'name_fr'
    ) THEN
        ALTER TABLE menu_items ADD COLUMN name_fr VARCHAR(255);
    END IF;
    
    -- 添加笔记列
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'menu_items' AND column_name = 'notes'
    ) THEN
        ALTER TABLE menu_items ADD COLUMN notes TEXT;
    END IF;
    
    -- 添加size_options列
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'menu_items' AND column_name = 'size_options'
    ) THEN
        ALTER TABLE menu_items 
        ADD COLUMN size_options JSONB DEFAULT '{"sizes": [], "uniform_price": true}';
    END IF;
    
    -- 为categories表添加法文名称列
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'categories' AND column_name = 'name_fr'
    ) THEN
        ALTER TABLE categories ADD COLUMN name_fr VARCHAR(100);
    END IF;
    
    -- 为categories表添加图片链接列
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'categories' AND column_name = 'image_url'
    ) THEN
        ALTER TABLE categories ADD COLUMN image_url TEXT;
    END IF;
END $$;

-- 创建促销信息表
CREATE TABLE IF NOT EXISTS promotions (
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

-- 创建传承轮播器表
CREATE TABLE IF NOT EXISTS heritage_carousel (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    subtitle VARCHAR(255) NOT NULL,
    image_url TEXT NOT NULL,
    description TEXT,
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- 2. 创建触发器函数
-- =============================================

-- 创建更新时间的触发器函数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 为相关表创建更新时间触发器
DROP TRIGGER IF EXISTS update_menu_items_updated_at ON menu_items;
CREATE TRIGGER update_menu_items_updated_at 
    BEFORE UPDATE ON menu_items 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_promotions_updated_at ON promotions;
CREATE TRIGGER update_promotions_updated_at 
    BEFORE UPDATE ON promotions 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_heritage_carousel_updated_at ON heritage_carousel;
CREATE TRIGGER update_heritage_carousel_updated_at 
    BEFORE UPDATE ON heritage_carousel 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- 3. 杯型选项配置说明
-- =============================================

/*
杯型选项 (size_options) JSON 结构说明：

差异化价格配置：
{
  "sizes": [
    {"name": "Small", "price": 2.55},
    {"name": "Medium", "price": 2.75},
    {"name": "Large", "price": 3.25}
  ],
  "uniform_price": false
}

统一价格配置：
{
  "sizes": ["Small", "Medium", "Large"],
  "uniform_price": true
}

仅支持部分杯型：
{
  "sizes": [
    {"name": "Medium", "price": 5.45},
    {"name": "Large", "price": 5.95}
  ],
  "uniform_price": false
}

不支持杯型选择（如特色甜品）：
{
  "sizes": [],
  "uniform_price": true
}
*/

-- =============================================
-- 4. 清理和插入初始数据
-- =============================================

-- 清理现有数据
DELETE FROM menu_items;
DELETE FROM categories;
DELETE FROM promotions;
DELETE FROM heritage_carousel;

-- 重置序列
SELECT setval('categories_id_seq', 1, false);
SELECT setval('menu_items_id_seq', 1, false);
SELECT setval('promotions_id_seq', 1, false);
SELECT setval('heritage_carousel_id_seq', 1, false);

-- 插入菜单分类（英文主要，法文第二语言，包含图片链接）
INSERT INTO categories (name, name_fr, description, image_url, sort_order) VALUES
('Coffee Selection', 'Sélection de Café', 'Premium coffee beverages prepared with fresh espresso', 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400&h=300&fit=crop', 1),
('Cold Coffee Drinks', 'Boissons Café Froid', 'Refreshing iced coffee beverages', 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=400&h=300&fit=crop', 2),
('Frappe', 'Frappé', 'Blended ice coffee drinks', 'https://images.unsplash.com/photo-1570197788417-0e82375c9371?w=400&h=300&fit=crop', 3),
('Smoothies', 'Smoothies', 'Fresh fruit smoothies with banana', 'https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=400&h=300&fit=crop', 4),
('Milkshakes', 'Milkshakes', 'Creamy milkshakes in various flavors', 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=400&h=300&fit=crop', 5),
('Iced Teas', 'Thés Glacés', 'Refreshing iced tea selections', 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400&h=300&fit=crop', 6),
('Tea Lattes', 'Lattes au Thé', 'Specialty tea-based lattes', 'https://images.unsplash.com/photo-1571091655789-405eb7a3a3a8?w=400&h=300&fit=crop', 7),
('Italian Soda', 'Soda Italien', 'Sparkling flavored sodas', 'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=400&h=300&fit=crop', 8),
('House Signature Drinks', 'Boissons Signature', 'Westdale Cafe exclusive beverages', 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400&h=300&fit=crop', 9),
('Bagel Bar', 'Bar à Bagels', 'Fresh bagels with spreads and sandwich options', 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&h=300&fit=crop', 10),
('Sandwiches', 'Sandwichs', 'Gourmet sandwiches on croissant or bread', 'https://images.unsplash.com/photo-1539252554453-80ab65ce3586?w=400&h=300&fit=crop', 11),
('Combos', 'Combos', 'Meal combinations and special offers', 'https://images.unsplash.com/photo-1481931098730-318b6f776db0?w=400&h=300&fit=crop', 12),
('Bingsu', 'Bingsu', 'Korean-style shaved ice dessert', 'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=400&h=300&fit=crop', 13),
('House Special Desserts', 'Desserts Spéciaux', 'Signature desserts and sweet treats', 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=400&h=300&fit=crop', 14);

-- =============================================
-- 5. 插入菜品数据
-- =============================================

-- Coffee Selection
INSERT INTO menu_items (category_id, name, name_fr, description, price, size_options, notes, is_featured, sort_order) VALUES
(1, 'Brew Coffee', 'Café Filtre', 'Fresh brewed coffee made from premium beans', 2.55, '{"sizes": [{"name": "Small", "price": 2.55}, {"name": "Medium", "price": 2.75}, {"name": "Large", "price": 3.25}], "uniform_price": false}', '', true, 1),
(1, 'Espresso', 'Espresso', 'Rich and bold espresso shots', 2.95, '{"sizes": [{"name": "Small", "price": 2.95}, {"name": "Medium", "price": 3.55}, {"name": "Large", "price": 3.85}], "uniform_price": false}', '', false, 2),
(1, 'Americano', 'Americano', 'Espresso shots with hot water', 3.65, '{"sizes": [{"name": "Small", "price": 3.65}, {"name": "Medium", "price": 4.15}, {"name": "Large", "price": 4.65}], "uniform_price": false}', '', false, 3),
(1, 'Latte', 'Latte', 'Espresso with steamed milk and light foam', 4.95, '{"sizes": [{"name": "Small", "price": 4.95}, {"name": "Medium", "price": 5.45}, {"name": "Large", "price": 5.75}], "uniform_price": false}', '', true, 4),
(1, 'Flavor Latte', 'Latte Aromatisé', 'Latte with your choice of flavor syrup', 5.35, '{"sizes": [{"name": "Small", "price": 5.35}, {"name": "Medium", "price": 5.75}, {"name": "Large", "price": 6.05}], "uniform_price": false}', '', false, 5),
(1, 'Cappuccino', 'Cappuccino', 'Espresso with steamed milk and thick foam', 4.95, '{"sizes": [{"name": "Small", "price": 4.95}, {"name": "Medium", "price": 5.45}, {"name": "Large", "price": 5.75}], "uniform_price": false}', '', false, 6),
(1, 'Flat White', 'Flat White', 'Double espresso with steamed milk', 4.85, '{"sizes": [], "uniform_price": true}', '', false, 7),
(1, 'Brew White', 'Café au Lait', 'Brewed coffee with steamed milk', 4.15, '{"sizes": [], "uniform_price": true}', '', false, 8),
(1, 'Americano Misto', 'Americano Misto', 'Americano with steamed milk', 4.15, '{"sizes": [{"name": "Small", "price": 4.15}, {"name": "Medium", "price": 4.45}, {"name": "Large", "price": 4.85}], "uniform_price": false}', '', false, 9),
(1, 'Red Eye', 'Red Eye', 'Brewed coffee with espresso shot', 5.85, '{"sizes": [], "uniform_price": true}', '', false, 10),
(1, 'Spanish Latte', 'Latte Espagnol', 'Latte with condensed milk and cinnamon', 5.35, '{"sizes": [{"name": "Small", "price": 5.35}, {"name": "Medium", "price": 5.75}, {"name": "Large", "price": 6.05}], "uniform_price": false}', '', true, 11),
(1, 'Mocha', 'Moka', 'Espresso with chocolate and steamed milk', 5.35, '{"sizes": [{"name": "Small", "price": 5.35}, {"name": "Medium", "price": 5.75}, {"name": "Large", "price": 6.05}], "uniform_price": false}', '', false, 12),
(1, 'Hot Chocolate', 'Chocolat Chaud', 'Rich hot chocolate with whipped cream', 4.15, '{"sizes": [{"name": "Small", "price": 4.15}, {"name": "Medium", "price": 4.55}, {"name": "Large", "price": 5.05}], "uniform_price": false}', '', false, 13);

-- Cold Coffee Drinks
INSERT INTO menu_items (category_id, name, name_fr, description, price, size_options, notes, is_featured, sort_order) VALUES
(2, 'Cold Brew', 'Café Froid', 'Smooth cold-brewed coffee served over ice', 5.05, '{"sizes": [{"name": "Small", "price": 5.05}, {"name": "Medium", "price": 5.45}, {"name": "Large", "price": 5.95}], "uniform_price": false}', '', true, 1),
(2, 'Iced Latte', 'Latte Glacé', 'Espresso with cold milk served over ice', 4.95, '{"sizes": [{"name": "Small", "price": 4.95}, {"name": "Medium", "price": 5.45}, {"name": "Large", "price": 5.95}], "uniform_price": false}', '', false, 2),
(2, 'Iced Raspberry-Mocha', 'Moka Framboise Glacé', 'Iced mocha with raspberry flavor', 5.35, '{"sizes": [{"name": "Small", "price": 5.35}, {"name": "Medium", "price": 5.75}, {"name": "Large", "price": 6.05}], "uniform_price": false}', '', false, 3);

-- Frappe
INSERT INTO menu_items (category_id, name, name_fr, description, price, size_options, notes, is_featured, sort_order) VALUES
(3, 'Vanilla Frappe', 'Frappé Vanille', 'Blended ice coffee with vanilla', 5.95, '{"sizes": [{"name": "Small", "price": 5.95}, {"name": "Medium", "price": 6.25}, {"name": "Large", "price": 6.75}], "uniform_price": false}', '', false, 1),
(3, 'Caramel Frappe', 'Frappé Caramel', 'Blended ice coffee with caramel', 5.95, '{"sizes": [{"name": "Small", "price": 5.95}, {"name": "Medium", "price": 6.25}, {"name": "Large", "price": 6.75}], "uniform_price": false}', '', false, 2),
(3, 'Mocha Frappe', 'Frappé Moka', 'Blended ice coffee with chocolate', 5.95, '{"sizes": [{"name": "Small", "price": 5.95}, {"name": "Medium", "price": 6.25}, {"name": "Large", "price": 6.75}], "uniform_price": false}', '', false, 3);

-- Smoothies
INSERT INTO menu_items (category_id, name, name_fr, description, price, size_options, notes, is_featured, sort_order) VALUES
(4, 'Strawberry Smoothie', 'Smoothie Fraise', 'Fresh strawberry smoothie', 7.35, '{"sizes": ["Small", "Medium", "Large"], "uniform_price": true}', 'with banana', false, 1),
(4, 'Mango Smoothie', 'Smoothie Mangue', 'Tropical mango smoothie', 7.35, '{"sizes": ["Small", "Medium", "Large"], "uniform_price": true}', 'with banana', false, 2),
(4, 'Almond Date Smoothie', 'Smoothie Amande Datte', 'Nutritious almond and date smoothie', 7.35, '{"sizes": ["Small", "Medium", "Large"], "uniform_price": true}', 'with banana', false, 3),
(4, 'Chocolate Smoothie', 'Smoothie Chocolat', 'Rich chocolate smoothie', 7.35, '{"sizes": ["Small", "Medium", "Large"], "uniform_price": true}', 'with banana', false, 4),
(4, 'Dragon Fruit Smoothie', 'Smoothie Fruit du Dragon', 'Exotic dragon fruit smoothie', 7.35, '{"sizes": ["Small", "Medium", "Large"], "uniform_price": true}', 'with banana', false, 5);

-- Milkshakes
INSERT INTO menu_items (category_id, name, name_fr, description, price, size_options, notes, is_featured, sort_order) VALUES
(5, 'Chocolate Milkshake', 'Milkshake Chocolat', 'Classic chocolate milkshake', 6.05, '{"sizes": [{"name": "Small", "price": 6.05}, {"name": "Medium", "price": 6.35}, {"name": "Large", "price": 6.85}], "uniform_price": false}', '', false, 1),
(5, 'Cotton Candy Milkshake', 'Milkshake Barbe à Papa', 'Sweet cotton candy flavored milkshake', 6.05, '{"sizes": [{"name": "Small", "price": 6.05}, {"name": "Medium", "price": 6.35}, {"name": "Large", "price": 6.85}], "uniform_price": false}', '', false, 2),
(5, 'Mango Milkshake', 'Milkshake Mangue', 'Tropical mango milkshake', 6.05, '{"sizes": [{"name": "Small", "price": 6.05}, {"name": "Medium", "price": 6.35}, {"name": "Large", "price": 6.85}], "uniform_price": false}', '', false, 3),
(5, 'Strawberry Rose Milkshake', 'Milkshake Fraise Rose', 'Elegant strawberry rose milkshake', 6.05, '{"sizes": [{"name": "Small", "price": 6.05}, {"name": "Medium", "price": 6.35}, {"name": "Large", "price": 6.85}], "uniform_price": false}', '', false, 4),
(5, 'Guava Milkshake', 'Milkshake Goyave', 'Tropical guava milkshake', 6.05, '{"sizes": [{"name": "Small", "price": 6.05}, {"name": "Medium", "price": 6.35}, {"name": "Large", "price": 6.85}], "uniform_price": false}', '', false, 5),
(5, 'Dragon Fruit Milkshake', 'Milkshake Fruit du Dragon', 'Exotic dragon fruit milkshake', 6.05, '{"sizes": [{"name": "Small", "price": 6.05}, {"name": "Medium", "price": 6.35}, {"name": "Large", "price": 6.85}], "uniform_price": false}', '', false, 6),
(5, 'Grapefruit Honey Milkshake', 'Milkshake Pamplemousse Miel', 'Refreshing grapefruit honey milkshake', 6.05, '{"sizes": [{"name": "Small", "price": 6.05}, {"name": "Medium", "price": 6.35}, {"name": "Large", "price": 6.85}], "uniform_price": false}', '', false, 7),
(5, 'Tropical Coconut Milkshake', 'Milkshake Coco Tropical', 'Creamy tropical coconut milkshake', 6.05, '{"sizes": [{"name": "Small", "price": 6.05}, {"name": "Medium", "price": 6.35}, {"name": "Large", "price": 6.85}], "uniform_price": false}', '', false, 8);

-- Iced Teas
INSERT INTO menu_items (category_id, name, name_fr, description, price, size_options, notes, is_featured, sort_order) VALUES
(6, 'Lemon Tea', 'Thé Citron', 'Refreshing iced tea with lemon', 4.55, '{"sizes": [{"name": "Small", "price": 4.55}, {"name": "Medium", "price": 5.05}, {"name": "Large", "price": 5.55}], "uniform_price": false}', '', false, 1),
(6, 'Peach Green Tea', 'Thé Vert Pêche', 'Green tea with sweet peach flavor', 4.55, '{"sizes": [{"name": "Small", "price": 4.55}, {"name": "Medium", "price": 5.05}, {"name": "Large", "price": 5.55}], "uniform_price": false}', '', false, 2),
(6, 'Hibiscus Tea', 'Thé Hibiscus', 'Floral hibiscus tea with coconut milk', 4.55, '{"sizes": [{"name": "Small", "price": 4.55}, {"name": "Medium", "price": 5.05}, {"name": "Large", "price": 5.55}], "uniform_price": false}', 'w/ coconut milk', false, 3),
(6, 'Passion Fruit Mint Tea', 'Thé Menthe Fruit de la Passion', 'Tropical passion fruit tea with fresh mint', 5.45, '{"sizes": [{"name": "Small", "price": 5.45}, {"name": "Medium", "price": 5.95}, {"name": "Large", "price": 6.35}], "uniform_price": false}', '', false, 4);

-- Tea Lattes
INSERT INTO menu_items (category_id, name, name_fr, description, price, size_options, notes, is_featured, sort_order) VALUES
(7, 'Matcha Latte', 'Latte Matcha', 'Premium Japanese matcha with steamed milk', 5.45, '{"sizes": [{"name": "Small", "price": 5.45}, {"name": "Medium", "price": 5.95}, {"name": "Large", "price": 6.35}], "uniform_price": false}', '', true, 1),
(7, 'Chai Latte', 'Latte Chai', 'Spiced tea latte with warm spices', 5.45, '{"sizes": [{"name": "Small", "price": 5.45}, {"name": "Medium", "price": 5.95}, {"name": "Large", "price": 6.35}], "uniform_price": false}', '', false, 2),
(7, 'Strawberry Matcha', 'Matcha Fraise', 'Matcha latte with strawberry flavor', 5.45, '{"sizes": [{"name": "Small", "price": 5.45}, {"name": "Medium", "price": 5.95}, {"name": "Large", "price": 6.35}], "uniform_price": false}', 'Recommended Iced', false, 3),
(7, 'Yuzu Matcha', 'Matcha Yuzu', 'Matcha latte with citrusy yuzu', 5.45, '{"sizes": [{"name": "Small", "price": 5.45}, {"name": "Medium", "price": 5.95}, {"name": "Large", "price": 6.35}], "uniform_price": false}', 'Recommended Iced', false, 4),
(7, 'Brown Sugar Hojicha Latte', 'Latte Hojicha Sucre Brun', 'Roasted tea latte with brown sugar', 5.45, '{"sizes": [{"name": "Small", "price": 5.45}, {"name": "Medium", "price": 5.95}, {"name": "Large", "price": 6.35}], "uniform_price": false}', '', false, 5),
(7, 'Tumeric Latte', 'Latte Curcuma', 'Golden turmeric latte with spices', 5.45, '{"sizes": [{"name": "Small", "price": 5.45}, {"name": "Medium", "price": 5.95}, {"name": "Large", "price": 6.35}], "uniform_price": false}', '', false, 6),
(7, 'Black Sesame Latte', 'Latte Sésame Noir', 'Nutty black sesame latte', 5.45, '{"sizes": [{"name": "Small", "price": 5.45}, {"name": "Medium", "price": 5.95}, {"name": "Large", "price": 6.35}], "uniform_price": false}', '', false, 7),
(7, 'Taro Latte', 'Latte Taro', 'Purple taro root latte', 5.45, '{"sizes": [{"name": "Small", "price": 5.45}, {"name": "Medium", "price": 5.95}, {"name": "Large", "price": 6.35}], "uniform_price": false}', '', false, 8),
(7, 'London Fog', 'London Fog', 'Earl Grey tea latte with vanilla', 5.45, '{"sizes": [{"name": "Small", "price": 5.45}, {"name": "Medium", "price": 5.95}, {"name": "Large", "price": 6.35}], "uniform_price": false}', '', false, 9),
(7, 'Honey Tea Latte', 'Latte Thé Miel', 'Tea latte sweetened with honey', 5.45, '{"sizes": [{"name": "Small", "price": 5.45}, {"name": "Medium", "price": 5.95}, {"name": "Large", "price": 6.35}], "uniform_price": false}', '', false, 10);

-- Italian Soda
INSERT INTO menu_items (category_id, name, name_fr, description, price, size_options, notes, is_featured, sort_order) VALUES
(8, 'Italian Soda', 'Soda Italien', 'Sparkling water with flavor syrup', 4.05, '{"sizes": [{"name": "Small", "price": 4.05}, {"name": "Medium", "price": 4.55}, {"name": "Large", "price": 5.05}], "uniform_price": false}', 'Ask for available flavours', false, 1);

-- House Signature Drinks
INSERT INTO menu_items (category_id, name, name_fr, description, price, size_options, notes, is_featured, sort_order) VALUES
(9, 'Tico Latte', 'Latte Tico', 'Westdale Cafe signature latte blend', 5.75, '{"sizes": [], "uniform_price": true}', '', true, 1),
(9, 'Affogato', 'Affogato', 'Vanilla gelato "drowned" in hot espresso', 8.05, '{"sizes": [], "uniform_price": true}', '', true, 2),
(9, 'Mocha Ice Cream Dream', 'Rêve Glace Moka', 'Mocha with premium ice cream', 8.05, '{"sizes": [], "uniform_price": true}', '', true, 3),
(9, 'Frozen Chocolate', 'Chocolat Glacé', 'Blended frozen chocolate drink', 4.25, '{"sizes": [{"name": "Small", "price": 4.25}, {"name": "Medium", "price": 4.75}, {"name": "Large", "price": 5.25}], "uniform_price": false}', '', false, 4);

-- Bagel Bar
INSERT INTO menu_items (category_id, name, name_fr, description, price, size_options, notes, is_featured, sort_order) VALUES
(10, 'Bagel Spread', 'Bagel Garni', 'Fresh bagel with your choice of spread', 4.25, '{"sizes": [], "uniform_price": true}', 'Butter; Cream Cheese; Jam; Nutella', false, 1),
(10, 'Bagel Sandwiches', 'Sandwichs Bagel', 'Gourmet bagel sandwiches', 10.95, '{"sizes": [], "uniform_price": true}', 'Smoked Salmon; Beef; Chicken; Ham; Prosciutto; Arugula; Lettuce', false, 2);

-- Sandwiches
INSERT INTO menu_items (category_id, name, name_fr, description, price, size_options, notes, is_featured, sort_order) VALUES
(11, 'Ham & Cheese', 'Jambon Fromage', 'Classic ham and cheese sandwich', 10.95, '{"sizes": [], "uniform_price": true}', 'Croissant/Triple Bread', false, 1),
(11, 'Beef', 'Bœuf', 'Premium beef sandwich', 10.95, '{"sizes": [], "uniform_price": true}', 'Croissant/Triple Bread', false, 2),
(11, 'Smoked Salmon', 'Saumon Fumé', 'Smoked salmon sandwich', 10.95, '{"sizes": [], "uniform_price": true}', 'Croissant/Triple Bread', false, 3),
(11, 'Prosciutto', 'Prosciutto', 'Italian prosciutto sandwich', 10.95, '{"sizes": [], "uniform_price": true}', 'Croissant/Triple Bread', false, 4),
(11, 'Vegetarian', 'Végétarien', 'Fresh vegetarian sandwich', 10.95, '{"sizes": [], "uniform_price": true}', 'Croissant/Triple Bread', false, 5),
(11, 'Arugula', 'Roquette', 'Fresh arugula sandwich', 10.95, '{"sizes": [], "uniform_price": true}', 'Croissant/Triple Bread', false, 6),
(11, 'Lettuce', 'Laitue', 'Fresh lettuce sandwich', 10.95, '{"sizes": [], "uniform_price": true}', 'Croissant/Triple Bread', false, 7);

-- Combos
INSERT INTO menu_items (category_id, name, name_fr, description, price, size_options, notes, is_featured, sort_order) VALUES
(12, 'Breakfast Combo', 'Combo Petit-Déjeuner', 'Breakfast sandwich with drink', 6.85, '{"sizes": [], "uniform_price": true}', 'Breakfast Sandwich + Coffee; Tea; or Italian Soda', true, 1),
(12, 'Lunch Combo', 'Combo Déjeuner', 'Sandwich with drink', 10.95, '{"sizes": [], "uniform_price": true}', 'Ham Croissant; Cheese Melt; Ham Cheese Melt + Drink', true, 2),
(12, 'Ramen', 'Ramen', 'Self-serve ramen bowl', 10.95, '{"sizes": [], "uniform_price": true}', 'Self Serve', false, 3),
(12, 'Ramen Add-Ons', 'Suppléments Ramen', 'Additional toppings for ramen', 1.50, '{"sizes": [], "uniform_price": true}', 'Egg; Beef; Pork; Veg (+$1.50)', false, 4),
(12, 'Cereals', 'Céréales', 'Breakfast cereals with milk options', 4.85, '{"sizes": [], "uniform_price": true}', 'With Different Milk Options', false, 5);

-- Bingsu
INSERT INTO menu_items (category_id, name, name_fr, description, price, size_options, notes, is_featured, sort_order) VALUES
(13, 'Bingsu', 'Bingsu', 'Korean-style shaved ice dessert', 10.95, '{"sizes": [], "uniform_price": true}', 'Strawberry; Mango; Vanilla', true, 1);

-- House Special Desserts
INSERT INTO menu_items (category_id, name, name_fr, description, price, size_options, notes, is_featured, sort_order) VALUES
(14, 'Classic Waffle with Whipped Cream', 'Gaufre Classique Crème Fouettée', 'Fresh waffle topped with whipped cream', 6.85, '{"sizes": [], "uniform_price": true}', '', true, 1),
(14, 'Egg Waffle Hong Kong Style', 'Gaufre aux Œufs Style Hong Kong', 'Traditional Hong Kong egg waffle', 8.95, '{"sizes": [], "uniform_price": true}', '', true, 2),
(14, 'Toasted Pecan Square with Vanilla Ice Cream', 'Carré Pacane Grillé Glace Vanille', 'Warm pecan square with vanilla ice cream', 8.95, '{"sizes": [], "uniform_price": true}', '', true, 3);

-- 插入促销信息
INSERT INTO promotions (title, description, discount_percentage, start_date, end_date, is_active) VALUES
('Grand Opening Special', 'Celebrate Westdale Cafe''s grand opening! 20% off all beverages during our first month', 20, CURRENT_DATE, CURRENT_DATE + INTERVAL '30 days', true),
('Student Discount', 'Show your valid student ID and enjoy 10% off all drinks', 10, CURRENT_DATE, CURRENT_DATE + INTERVAL '365 days', true),
('Weekend Brunch Special', 'Buy any sandwich or combo and get 15% off your total order on weekends', 15, CURRENT_DATE, CURRENT_DATE + INTERVAL '180 days', true);

-- 插入传承轮播器数据
INSERT INTO heritage_carousel (title, subtitle, image_url, description, sort_order) VALUES
('Artisanal Craft', 'Crafted with Care', 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800&h=600&fit=crop', 'Every beverage is carefully crafted using traditional methods and premium ingredients', 1),
('Community Heart', 'At the Heart of Community', 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=800&h=600&fit=crop', 'Westdale Cafe serves as a gathering place where neighbors become friends over great coffee', 2),
('Quality Heritage', 'Heritage of Quality', 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=800&h=600&fit=crop', 'From dawn to dusk, we maintain our commitment to exceptional quality and warm hospitality', 3);

-- =============================================
-- 6. 创建索引优化查询性能
-- =============================================

-- 为常用查询字段创建索引
CREATE INDEX IF NOT EXISTS idx_menu_items_category_sort ON menu_items(category_id, sort_order);
CREATE INDEX IF NOT EXISTS idx_menu_items_available ON menu_items(is_available);
CREATE INDEX IF NOT EXISTS idx_menu_items_featured ON menu_items(is_featured);
CREATE INDEX IF NOT EXISTS idx_categories_active_sort ON categories(is_active, sort_order);
CREATE INDEX IF NOT EXISTS idx_promotions_active ON promotions(is_active);
CREATE INDEX IF NOT EXISTS idx_heritage_carousel_active_sort ON heritage_carousel(is_active, sort_order);

-- 为 JSONB 字段创建 GIN 索引以优化查询
CREATE INDEX IF NOT EXISTS idx_menu_items_size_options ON menu_items USING GIN (size_options);

-- =============================================
-- 7. 创建便捷查询视图
-- =============================================

-- 创建菜单项目详细视图（包含杯型信息）
-- 先删除旧视图以避免列名冲突
DROP VIEW IF EXISTS menu_items_with_sizes;

CREATE VIEW menu_items_with_sizes AS
SELECT 
    m.id,
    m.category_id,
    c.name as category_name,
    c.name_fr as category_name_fr,
    c.image_url as category_image_url,
    m.name,
    m.name_fr,
    m.description,
    m.price,
    m.size_options,
    m.notes,
    -- 提取杯型信息
    CASE 
        WHEN jsonb_array_length(m.size_options->'sizes') > 0 
        THEN m.size_options->'sizes'
        ELSE '[]'::jsonb
    END as available_sizes,
    (m.size_options->>'uniform_price')::boolean as is_uniform_price,
    m.image_url,
    m.is_available,
    m.is_featured,
    m.sort_order,
    m.created_at,
    m.updated_at
FROM menu_items m
JOIN categories c ON m.category_id = c.id
WHERE m.is_available = true AND c.is_active = true
ORDER BY c.sort_order, m.sort_order;

-- =============================================
-- 8. 创建便捷查询函数
-- =============================================

-- 获取菜品的可用杯型
CREATE OR REPLACE FUNCTION get_menu_item_sizes(item_id INTEGER)
RETURNS JSONB AS $$
DECLARE
    sizes_result JSONB;
BEGIN
    SELECT size_options->'sizes' INTO sizes_result
    FROM menu_items 
    WHERE id = item_id;
    
    RETURN COALESCE(sizes_result, '[]'::jsonb);
END;
$$ LANGUAGE plpgsql;

-- 检查菜品是否支持指定杯型
CREATE OR REPLACE FUNCTION menu_item_has_size(item_id INTEGER, size_name TEXT)
RETURNS BOOLEAN AS $$
DECLARE
    has_size BOOLEAN := false;
    size_options_data JSONB;
BEGIN
    SELECT size_options INTO size_options_data
    FROM menu_items 
    WHERE id = item_id;
    
    -- 检查是否为统一价格模式
    IF (size_options_data->>'uniform_price')::boolean THEN
        SELECT size_options_data->'sizes' @> to_jsonb(size_name) INTO has_size;
    ELSE
        -- 检查差异化价格模式
        SELECT EXISTS(
            SELECT 1 FROM jsonb_array_elements(size_options_data->'sizes') as size_obj
            WHERE size_obj->>'name' = size_name
        ) INTO has_size;
    END IF;
    
    RETURN has_size;
END;
$$ LANGUAGE plpgsql;

-- 获取指定杯型的价格
CREATE OR REPLACE FUNCTION get_menu_item_price(item_id INTEGER, size_name TEXT DEFAULT NULL)
RETURNS DECIMAL AS $$
DECLARE
    base_price DECIMAL;
    size_options_data JSONB;
    size_price DECIMAL;
BEGIN
    SELECT price, size_options INTO base_price, size_options_data
    FROM menu_items 
    WHERE id = item_id;
    
    -- 如果没有指定杯型或没有杯型选项，返回基础价格
    IF size_name IS NULL OR jsonb_array_length(size_options_data->'sizes') = 0 THEN
        RETURN base_price;
    END IF;
    
    -- 如果是统一价格模式，返回基础价格
    IF (size_options_data->>'uniform_price')::boolean THEN
        RETURN base_price;
    END IF;
    
    -- 差异化价格模式，查找指定杯型的价格
    SELECT (size_obj->>'price')::decimal INTO size_price
    FROM jsonb_array_elements(size_options_data->'sizes') as size_obj
    WHERE size_obj->>'name' = size_name;
    
    RETURN COALESCE(size_price, base_price);
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- 9. 验证数据
-- =============================================

-- 显示所有分类和对应的菜品数量
SELECT 
    c.name as category_name,
    c.name_fr as category_name_fr,
    COUNT(m.id) as item_count,
    COUNT(CASE WHEN m.is_featured THEN 1 END) as featured_count,
    COUNT(CASE WHEN jsonb_array_length(m.size_options->'sizes') > 0 THEN 1 END) as items_with_sizes
FROM categories c
LEFT JOIN menu_items m ON c.id = m.category_id AND m.is_available = true
WHERE c.is_active = true
GROUP BY c.id, c.name, c.name_fr, c.sort_order
ORDER BY c.sort_order;

-- 显示杯型配置示例
SELECT 
    c.name as category,
    m.name,
    m.price as base_price,
    m.size_options,
    CASE 
        WHEN jsonb_array_length(m.size_options->'sizes') = 0 THEN 'No sizes'
        WHEN (m.size_options->>'uniform_price')::boolean THEN 'Uniform pricing'
        ELSE 'Different pricing'
    END as pricing_type
FROM menu_items m
JOIN categories c ON m.category_id = c.id
WHERE m.is_available = true
ORDER BY c.sort_order, m.sort_order
LIMIT 15;

-- 显示传承轮播器数据
SELECT title, subtitle, description FROM heritage_carousel WHERE is_active = true ORDER BY sort_order;

-- 显示活跃的促销信息
SELECT title, discount_percentage, start_date, end_date FROM promotions WHERE is_active = true;

-- =============================================
-- 10. 设置权限 (可选)
-- =============================================

-- 如果需要启用行级安全，取消下面的注释
-- ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE promotions ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE heritage_carousel ENABLE ROW LEVEL SECURITY;

-- 创建公共读取策略 (允许匿名用户读取数据)
-- CREATE POLICY "Enable read access for all users" ON categories FOR SELECT USING (true);
-- CREATE POLICY "Enable read access for all users" ON menu_items FOR SELECT USING (true);
-- CREATE POLICY "Enable read access for all users" ON promotions FOR SELECT USING (true);
-- CREATE POLICY "Enable read access for all users" ON heritage_carousel FOR SELECT USING (true);

-- =============================================
-- 完成提示
-- =============================================

DO $$
BEGIN
    RAISE NOTICE '=================================================';
    RAISE NOTICE 'Westdale Cafe 数据库初始化完成！(真实菜品数据)';
    RAISE NOTICE '=================================================';
    RAISE NOTICE '✅ 创建了 % 个菜单分类', (SELECT COUNT(*) FROM categories);
    RAISE NOTICE '✅ 创建了 % 个菜单项目', (SELECT COUNT(*) FROM menu_items);
    RAISE NOTICE '✅ 其中 % 个支持杯型选择', (SELECT COUNT(*) FROM menu_items WHERE jsonb_array_length(size_options->'sizes') > 0);
    RAISE NOTICE '✅ 其中 % 个使用差异化价格', (SELECT COUNT(*) FROM menu_items WHERE (size_options->>'uniform_price')::boolean = false);
    RAISE NOTICE '✅ 创建了 % 个促销活动', (SELECT COUNT(*) FROM promotions);
    RAISE NOTICE '✅ 创建了 % 个传承轮播项', (SELECT COUNT(*) FROM heritage_carousel);
    RAISE NOTICE '=================================================';
    RAISE NOTICE '🌍 语言支持：';
    RAISE NOTICE '   - 主要语言：英文';
    RAISE NOTICE '   - 第二语言：法文';
    RAISE NOTICE '=================================================';
    RAISE NOTICE '📏 杯型与价格配置：';
    RAISE NOTICE '   - 差异化价格：不同杯型有不同价格';
    RAISE NOTICE '   - 统一价格：所有杯型价格相同';
    RAISE NOTICE '   - 单一规格：无杯型选择的产品';
    RAISE NOTICE '=================================================';
    RAISE NOTICE '🎯 主要分类：';
    RAISE NOTICE '   - Coffee Selection (咖啡选择)';
    RAISE NOTICE '   - Cold Coffee Drinks (冰咖啡)';
    RAISE NOTICE '   - Tea Lattes (茶拿铁)';
    RAISE NOTICE '   - Smoothies & Milkshakes (奶昔)';
    RAISE NOTICE '   - Food & Desserts (食物与甜品)';
    RAISE NOTICE '=================================================';
    RAISE NOTICE '🖼️  图片链接功能：';
    RAISE NOTICE '   - 每个分类都包含精选的图片链接';
    RAISE NOTICE '   - 使用 Unsplash 优质图片资源';
    RAISE NOTICE '   - 支持分类展示的视觉效果';
    RAISE NOTICE '=================================================';
    RAISE NOTICE '您可以开始使用支持真实菜品和差异化价格的 Westdale Cafe 网站了！';
    RAISE NOTICE '=================================================';
END $$; 

-- =============================================
-- 11. 创建商品表和数据 (Shop页面专用)
-- =============================================

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

-- 清理现有商品数据
DELETE FROM products;

-- 重置序列
SELECT setval('products_id_seq', 1, false);

-- 插入商品数据（包含 Westdale Cafe Mug222）
INSERT INTO products (name, description, price, paypal_data_id, image_url, is_featured, sort_order) VALUES
('Westdale Cafe Mug222', 'Premium ceramic mug with Westdale Cafe logo. Perfect for your daily coffee rituals at home.', 15.99, 'X2VFVALCA64RE', 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=400&h=400&fit=crop', true, 1),
('Westdale Blend Coffee Beans', 'Our signature house blend coffee beans, roasted to perfection. 340g bag of premium Arabica beans.', 24.99, 'PROD-002', 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=400&h=400&fit=crop', true, 2),
('Westdale Travel Tumbler', 'Double-walled stainless steel travel tumbler with Westdale logo. Keeps drinks hot for 6 hours.', 28.99, 'PROD-003', 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=400&fit=crop', true, 3),
('Vintage Coffee Grinder', 'Manual coffee grinder with adjustable settings. Perfect for fresh ground coffee at home.', 45.99, 'PROD-004', 'https://images.unsplash.com/photo-1609081219090-a6d81d3085bf?w=400&h=400&fit=crop', false, 4),
('Westdale Coffee Gift Set', 'Complete gift set including mug, coffee beans, and brewing guide. Perfect for coffee lovers.', 39.99, 'PROD-005', 'https://images.unsplash.com/photo-1511920170033-f8396924c348?w=400&h=400&fit=crop', true, 5),
('Artisan Espresso Cups Set', 'Set of 2 handcrafted ceramic espresso cups with matching saucers. Elegant and durable.', 22.99, 'PROD-006', 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400&h=400&fit=crop', false, 6);

-- 为products表创建更新时间触发器
DROP TRIGGER IF EXISTS update_products_updated_at ON products;
CREATE TRIGGER update_products_updated_at 
    BEFORE UPDATE ON products 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- 创建索引优化查询性能
CREATE INDEX IF NOT EXISTS idx_products_available ON products(is_available);
CREATE INDEX IF NOT EXISTS idx_products_featured ON products(is_featured);
CREATE INDEX IF NOT EXISTS idx_products_sort ON products(sort_order);
CREATE INDEX IF NOT EXISTS idx_products_paypal_id ON products(paypal_data_id);

-- 更新完成提示
DO $$
BEGIN
    RAISE NOTICE '=================================================';
    RAISE NOTICE '🛍️ 商品商店功能已添加！';
    RAISE NOTICE '=================================================';
    RAISE NOTICE '✅ 创建了 products 表';
    RAISE NOTICE '✅ 添加了 % 个商品（包含 Westdale Cafe Mug222）', (SELECT COUNT(*) FROM products);
    RAISE NOTICE '✅ 配置了 PayPal 购物车集成';
    RAISE NOTICE '✅ 商品包含完整的 PayPal data-id 配置';
    RAISE NOTICE '=================================================';
    RAISE NOTICE '🎯 商品列表：';
    RAISE NOTICE '   - Westdale Cafe Mug222 (PayPal ID: X2VFVALCA64RE)';
    RAISE NOTICE '   - Westdale Blend Coffee Beans';
    RAISE NOTICE '   - Westdale Travel Tumbler';
    RAISE NOTICE '   - Vintage Coffee Grinder';
    RAISE NOTICE '   - Westdale Coffee Gift Set';
    RAISE NOTICE '   - Artisan Espresso Cups Set';
    RAISE NOTICE '=================================================';
    RAISE NOTICE '现在可以在 shop.html 页面看到带有 PayPal 按钮的商品了！';
    RAISE NOTICE '=================================================';
END $$; 