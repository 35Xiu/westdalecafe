import { createClient } from 'https://cdn.skypack.dev/@supabase/supabase-js';
import { supabaseConfig } from '../supabase-config.js';

// 创建 Supabase 客户端
export const supabase = createClient(supabaseConfig.url, supabaseConfig.anonKey);

// 获取促销信息
export async function getPromotions() {
    try {
        const { data, error } = await supabase
            .from('special_offers')
            .select('*')
            .eq('is_active', true)
            .order('sort_order', { ascending: true });
        
        if (error) throw error;
        
        return data || [];
    } catch (error) {
        console.error('获取促销信息失败:', error);
        return [];
    }
}

// 获取菜单分类
export async function getCategories() {
    try {
        const { data, error } = await supabase
            .from('categories')
            .select('*')
            .eq('is_active', true)
            .order('sort_order', { ascending: true });
        
        if (error) throw error;
        return data;
    } catch (error) {
        console.error('获取菜单分类失败:', error);
        return [];
    }
}

// 获取菜单项目（按分类）
export async function getMenuItems(categoryId = null) {
    try {
        let query = supabase
            .from('menu_items')
            .select('*, categories(name, name_en)')
            .eq('is_available', true)
            .order('sort_order', { ascending: true });
        
        if (categoryId) {
            query = query.eq('category_id', categoryId);
        }
        
        const { data, error } = await query;
        
        if (error) throw error;
        return data;
    } catch (error) {
        console.error('获取菜单项目失败:', error);
        return [];
    }
}

// 获取所有菜单项目（按分类分组）
export async function getMenuByCategories() {
    try {
        const categories = await getCategories();
        const menuData = {};
        
        for (const category of categories) {
            const items = await getMenuItems(category.id);
            menuData[category.id] = {
                category: category,
                items: items
            };
        }
        
        return menuData;
    } catch (error) {
        console.error('获取菜单数据失败:', error);
        return {};
    }
}

// 获取单个分类信息
export async function getCategoryById(categoryId) {
    try {
        const { data, error } = await supabase
            .from('categories')
            .select('*')
            .eq('id', categoryId)
            .eq('is_active', true)
            .single();
        
        if (error) throw error;
        return data;
    } catch (error) {
        console.error('获取分类信息失败:', error);
        return null;
    }
}

// 获取传承轮播数据
export async function getHeritageCarousel() {
    try {
        const { data, error } = await supabase
            .from('heritage_carousel')
            .select('*')
            .eq('is_active', true)
            .order('sort_order', { ascending: true });
        
        if (error) throw error;
        return data;
    } catch (error) {
        console.error('获取传承轮播数据失败:', error);
        // 返回默认数据作为备用
        return [
            {
                id: 1,
                title: '传统工艺',
                subtitle: '怀着对工艺的用心',
                image_url: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800&h=600&fit=crop',
                description: '秉承百年咖啡制作工艺，每一杯都是时间与技艺的完美结合',
                sort_order: 1
            },
            {
                id: 2,
                title: '社区情怀',
                subtitle: '怀着对社区的用心',
                image_url: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=800&h=600&fit=crop',
                description: '植根于 Westdale 社区，用温暖的服务连接每一位邻里朋友',
                sort_order: 2
            },
            {
                id: 3,
                title: '经典时光',
                subtitle: '怀着对时光的用心',
                image_url: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=800&h=600&fit=crop',
                description: '从清晨第一缕阳光到傍晚温柔时分，陪伴您的每个美好时刻',
                sort_order: 3
            }
        ];
    }
}

// 获取商品信息（从products表）
export async function getProducts() {
    try {
        const { data, error } = await supabase
            .from('products')
            .select('*')
            .order('id', { ascending: true });
        
        if (error) throw error;
        
        // 如果products表为空，从menu_items中获取特色商品作为备选
        if (!data || data.length === 0) {
            console.log('Products表为空，使用menu_items作为备选商品数据');
            const { data: menuData, error: menuError } = await supabase
                .from('menu_items')
                .select('*')
                .eq('is_featured', true)
                .eq('is_available', true)
                .limit(6);
            
            if (menuError) throw menuError;
            
            // 转换菜单项目为商品格式
            return menuData.map(item => ({
                id: item.id,
                name: item.name,
                price: item.price,
                paypal_data_id: `PROD-${item.id.toString().padStart(3, '0')}`,
                description: item.description,
                image_url: item.image_url
            }));
        }
        
        return data;
    } catch (error) {
        console.error('获取商品信息失败:', error);
        return [];
    }
}

 