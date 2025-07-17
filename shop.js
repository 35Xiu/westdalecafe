import { supabase } from './supabase-client.js';

// PayPal Merchant ID - 请替换为实际的PayPal商户ID
const PAYPAL_MERCHANT_ID = 'QPA76K82XS4TQ';

// 获取商品信息
export async function getProducts() {
    try {
        // 从products表获取所有商品数据
        const { data, error } = await supabase
            .from('products')
            .select('*')
            .order('id');
        
        if (error) throw error;
        
        // 直接返回数据库中的商品数据
        return data || [];
    } catch (error) {
        console.error('获取商品信息失败:', error);
        return [];
    }
}

// 初始化PayPal Cart脚本
export function initializePayPalCart() {
    // 检查是否已经加载了PayPal Cart脚本
    if (document.querySelector('script[src*="paypalobjects.com/ncp/cart/cart.js"]')) {
        return;
    }
    
    const script = document.createElement('script');
    script.src = `https://www.paypalobjects.com/ncp/cart/cart.js`;
    script.setAttribute('data-merchant-id', PAYPAL_MERCHANT_ID);
    script.onload = function() {
        console.log('PayPal Cart script loaded successfully');
    };
    script.onerror = function() {
        console.error('Failed to load PayPal Cart script');
    };
    
    document.head.appendChild(script);
}

// 渲染商品列表
export function renderProducts(products, containerId) {
    const container = document.getElementById(containerId);
    if (!container) {
        console.error(`Container with id "${containerId}" not found`);
        return;
    }
    
    container.innerHTML = '';
    
    if (products.length === 0) {
        container.innerHTML = `
            <div class="col-span-full text-center py-12">
                <div class="w-16 h-16 bg-vintage-200 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg class="w-8 h-8 text-vintage-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path>
                    </svg>
                </div>
                <h3 class="text-xl font-script font-bold text-vintage-800 mb-2">No products available</h3>
                <p class="text-vintage-600 font-serif">Products are being prepared, stay tuned!</p>
            </div>
        `;
        return;
    }
    
    products.forEach(product => {
        const productCard = document.createElement('div');
        productCard.className = 'bg-white rounded-lg shadow-lg border-2 border-vintage-300 p-6 animate-slide-up hover:shadow-xl transition-shadow duration-300';
        
        // 格式化价格显示
        const formattedPrice = `${product.price}`;
        
        productCard.innerHTML = `
            <div class="mb-4">
                <h3 class="text-xl font-script font-bold text-vintage-800 mb-2">${product.name}</h3>
                <div class="text-2xl font-bold text-vintage-700 mb-4">${formattedPrice}</div>
            </div>
            
            <div class="flex flex-col space-y-3">
                <!-- PayPal Add to Cart Button -->
                <paypal-add-to-cart-button data-id="${product.paypal_data_id}" class="w-full"></paypal-add-to-cart-button>
            </div>
        `;
        
        container.appendChild(productCard);
    });
    
    // 初始化PayPal购物车按钮
    initializeCartButtons();
}

// 初始化购物车按钮
function initializeCartButtons() {
    // 等待PayPal脚本加载完成
    setTimeout(() => {
        if (typeof cartPaypal !== 'undefined') {
            // 为每个商品初始化AddToCart功能
            document.querySelectorAll('paypal-add-to-cart-button').forEach(button => {
                const productId = button.getAttribute('data-id');
                try {
                    console.log(`Initializing PayPal AddToCart for product: ${productId}`);
                    cartPaypal.AddToCart({ id: productId });
                } catch (error) {
                    console.error(`Failed to initialize cart for product ${productId}:`, error);
                }
            });
            
            // 初始化查看购物车按钮
            try {
                cartPaypal.Cart({ id: "pp-view-cart" });
                console.log('PayPal view cart button initialized');
            } catch (error) {
                console.error('Failed to initialize view cart button:', error);
            }
        } else {
            console.warn('PayPal Cart object not available, retrying...');
            // 如果PayPal还没加载完，再等一下重试
            setTimeout(initializeCartButtons, 2000);
        }
    }, 1500);
}

// 页面加载时初始化
export async function initializeShop() {
    console.log('正在初始化商店...');
    
    // 初始化PayPal Cart
    initializePayPalCart();
    
    // 加载商品
    const products = await getProducts();
    console.log('加载的商品:', products);
    
    // 渲染商品列表
    renderProducts(products, 'product-list');
    
    console.log('商店初始化完成');
}