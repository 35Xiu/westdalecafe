import { initializeShop } from './shop.js';
import { initializeMobileMenu } from './app.js';

// 页面加载完成后初始化商店和移动端菜单
document.addEventListener('DOMContentLoaded', async () => {
    try {
        // 初始化移动端菜单
        initializeMobileMenu();
        
        // 初始化商店
        await initializeShop();
    } catch (error) {
        console.error('商店初始化失败:', error);
        
        // 显示错误信息
        const productList = document.getElementById('product-list');
        if (productList) {
            productList.innerHTML = `
                <div class="col-span-full text-center py-12">
                    <div class="w-16 h-16 bg-red-200 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg class="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                    </div>
                    <h3 class="text-xl font-script font-bold text-red-800 mb-2">Loading failed</h3>
                    <p class="text-red-600 font-serif">Failed to load products, please refresh the page and try again.</p>
                </div>
            `;
        }
    }
});