import { getCategories, getCategoryById, getMenuItems } from './supabase-client.js';
import { authManager, favoritesManager } from './auth.js';

let allCategories = [];
let currentCategory = null;
let currentCategoryId = null;

// 页面加载完成后执行
document.addEventListener('DOMContentLoaded', async () => {
    await initializePage();
    initializeVintageEffects();
});

// 初始化页面
async function initializePage() {
    try {
        // 获取所有分类
        allCategories = await getCategories();
        
        // 获取URL参数
        const urlParams = new URLSearchParams(window.location.search);
        currentCategoryId = urlParams.get('category');
        
        // 渲染导航栏
        renderCategoryNav();
        
        if (currentCategoryId) {
            // 显示特定分类
            await loadCategoryPage(currentCategoryId);
        } else {
            // 显示分类选择页面
            renderCategorySelection();
        }
    } catch (error) {
        console.error('Error initializing page:', error);
        showError();
    }
}

// 加载分类页面
async function loadCategoryPage(categoryId) {
    try {
        // 获取分类信息
        currentCategory = await getCategoryById(categoryId);
        if (!currentCategory) {
            throw new Error('Category not found');
        }
        
        // 获取菜单项
        const menuItems = await getMenuItems(categoryId);
        
        // 渲染页面标题
        renderPageHeader(currentCategory);
        
        // 渲染菜单项
        renderMenuItems(menuItems);
        
    } catch (error) {
        console.error('Error loading category page:', error);
        showError();
    }
}

// 渲染分类导航
function renderCategoryNav() {
    const categoryNav = document.getElementById('category-nav');
    
    if (allCategories.length === 0) {
        categoryNav.innerHTML = `
            <div class="text-center py-4">
                <p class="text-vintage-300 font-serif">No menu categories available</p>
            </div>
        `;
        return;
    }
    
    const navItems = allCategories.map((category, index) => {
        const isActive = currentCategoryId == category.id;
        return `
            <a href="menu.html?category=${category.id}" 
               class="px-4 py-3 font-serif font-semibold transition-colors duration-300 border-b-2 animate-fade-in whitespace-nowrap flex-shrink-0 ${
                   isActive 
                   ? 'text-vintage-100 border-vintage-400' 
                   : 'text-vintage-200 hover:text-vintage-100 border-transparent hover:border-vintage-400'
               }"
               style="animation-delay: ${index * 0.1}s;">
                ${category.name}
            </a>
        `;
    }).join('');
    
    // 添加"所有分类"链接
    const allActive = !currentCategoryId;
    const allCategoriesLink = `
        <a href="menu.html" 
           class="px-4 py-3 font-serif font-semibold transition-colors duration-300 border-b-2 whitespace-nowrap flex-shrink-0 ${
               allActive 
               ? 'text-vintage-100 border-vintage-400' 
               : 'text-vintage-200 hover:text-vintage-100 border-transparent hover:border-vintage-400'
           }">
            All Categories
        </a>
    `;

    // 滑动按钮
    const leftButton = `
        <button id="scroll-left" class="flex-shrink-0 px-2 py-3 text-vintage-200 hover:text-vintage-100 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
            </svg>
        </button>
    `;
    
    const rightButton = `
        <button id="scroll-right" class="flex-shrink-0 px-2 py-3 text-vintage-200 hover:text-vintage-100 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
            </svg>
        </button>
    `;

    // 添加滑动提示
    const scrollHint = `
        <div class="text-center text-vintage-300 text-sm font-serif italic mt-2 md:hidden">
            Swipe right to explore more categories
        </div>
    `;
    
    categoryNav.innerHTML = `
        <div class="flex items-center">
            <div class="hidden md:block">${leftButton}</div>
            <div id="nav-scroll-container" class="flex space-x-4 overflow-x-auto scrollbar-hide flex-1 md:px-4" style="scrollbar-width: none; -ms-overflow-style: none;">
                ${allCategoriesLink}${navItems}
            </div>
            <div class="hidden md:block">${rightButton}</div>
        </div>
        ${scrollHint}
    `;
    
    // 初始化滑动功能
    setTimeout(() => {
        initializeNavScrolling();
    }, 100);
}

// 初始化导航滑动功能
function initializeNavScrolling() {
    const container = document.getElementById('nav-scroll-container');
    const leftButton = document.getElementById('scroll-left');
    const rightButton = document.getElementById('scroll-right');
    
    if (!container) return;
    
    // 桌面端滑动按钮功能
    if (leftButton && rightButton) {
        // 更新按钮状态
        function updateButtonStates() {
            const isAtStart = container.scrollLeft <= 0;
            const isAtEnd = container.scrollLeft >= container.scrollWidth - container.clientWidth;
            
            leftButton.disabled = isAtStart;
            rightButton.disabled = isAtEnd;
            
            leftButton.style.opacity = isAtStart ? '0.5' : '1';
            rightButton.style.opacity = isAtEnd ? '0.5' : '1';
        }
        
        // 滑动函数
        function scrollNav(direction) {
            const scrollAmount = 200; // 每次滑动200px
            const targetScroll = container.scrollLeft + (direction === 'left' ? -scrollAmount : scrollAmount);
            
            container.scrollTo({
                left: targetScroll,
                behavior: 'smooth'
            });
        }
        
        // 绑定事件
        leftButton.addEventListener('click', () => scrollNav('left'));
        rightButton.addEventListener('click', () => scrollNav('right'));
        
        // 监听滚动事件
        container.addEventListener('scroll', updateButtonStates);
        
        // 初始化按钮状态
        updateButtonStates();
        
        // 监听窗口大小变化
        window.addEventListener('resize', updateButtonStates);
    }
    
    // 键盘导航支持（所有设备）
    container.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft') {
            e.preventDefault();
            container.scrollBy({ left: -100, behavior: 'smooth' });
        } else if (e.key === 'ArrowRight') {
            e.preventDefault();
            container.scrollBy({ left: 100, behavior: 'smooth' });
        }
    });
    
    // 确保容器可以接收键盘事件
    container.setAttribute('tabindex', '0');
}

// 渲染页面标题（已移除页面标题组件，此函数保留但不执行任何操作）
function renderPageHeader(category = null) {
    // 页面标题组件已被删除，此函数不再执行任何操作
    return;
}

// 渲染分类选择页面
function renderCategorySelection() {
    const menuContainer = document.getElementById('menu-categories');
    
    renderPageHeader(); // 渲染通用标题
    
    if (allCategories.length === 0) {
        menuContainer.innerHTML = `
            <div class="text-center py-20">
                <div class="w-24 h-24 bg-vintage-300 rounded-full flex items-center justify-center mx-auto mb-6 border-4 border-vintage-400 animate-gentle-float">
                    <svg class="w-12 h-12 text-vintage-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
                    </svg>
                </div>
                <h3 class="text-3xl font-script font-bold text-vintage-700 mb-4">Menu in Preparation</h3>
                <p class="text-vintage-700 text-lg font-serif">We are carefully preparing our traditional menu, coming soon!</p>
            </div>
        `;
        return;
    }
    
    const categoriesHTML = `
        <div class="text-center mb-16">
            <h3 class="text-3xl font-script font-bold text-vintage-800 mb-4">Please Choose a Menu Category</h3>
            <button onclick="showQuickViewMenu()" class="px-6 py-2 bg-vintage-600 hover:bg-vintage-700 text-vintage-100 font-serif font-semibold rounded-none border-2 border-vintage-500 shadow-lg transition-all duration-300 hover:shadow-xl mb-8">
                Quick View Menu
            </button>
            <p class="text-lg text-vintage-700 font-serif mb-4">Not sure what to drink? Click the button below and let us pick a random drink for you.</p>
            
            <!-- Pick for me 按钮 -->
            <button onclick="pickRandomDrink()" class="px-6 py-3 bg-gradient-to-r from-vintage-700 to-vintage-600 hover:from-vintage-800 hover:to-vintage-700 text-vintage-100 font-serif font-semibold rounded-full border-2 border-vintage-500 shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-105 animate-gentle-float">
                <div class="flex items-center space-x-2">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path>
                    </svg>
                    <span>Pick for me</span>
                </div>
            </button>
        </div>
        
        <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            ${allCategories.map((category, index) => `
                <a href="menu.html?category=${category.id}" 
                   class="group block bg-vintage-50 border-2 border-vintage-300 shadow-lg hover:shadow-xl transition-all duration-300 hover:border-vintage-500 animate-fade-in"
                   style="animation-delay: ${index * 0.2}s;">
                    
                    <div class="relative h-48 border-b-2 border-vintage-300 overflow-hidden">
                        ${category.image_url ? `
                            <img src="${category.image_url}" alt="${category.name}" 
                                 class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500">
                            <div class="absolute inset-0 bg-gradient-to-t from-vintage-900/70 to-vintage-900/20 group-hover:from-vintage-900/60 group-hover:to-vintage-900/10 transition-all duration-300"></div>
                            <div class="absolute inset-0 flex items-center justify-center">
                                <div class="text-center">
                                    <h4 class="text-2xl font-script font-bold text-vintage-100 group-hover:text-white transition-colors duration-300 drop-shadow-lg">${category.name}</h4>
                                    ${category.name_fr ? `<p class="text-vintage-200 font-serif text-sm mt-1 drop-shadow-md">${category.name_fr}</p>` : ''}
                                </div>
                            </div>
                        ` : `
                            <div class="w-full h-full bg-gradient-to-br from-vintage-200 to-vintage-300 flex items-center justify-center vintage-paper group-hover:from-vintage-300 group-hover:to-vintage-400 transition-all duration-300">
                                <div class="text-center">
                                    <div class="w-20 h-20 bg-vintage-600 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-vintage-400 group-hover:bg-vintage-700 transition-colors duration-300">
                                        <svg class="w-10 h-10 text-vintage-100" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                                                  d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"></path>
                                        </svg>
                                    </div>
                                    <h4 class="text-2xl font-script font-bold text-vintage-700 group-hover:text-vintage-800 transition-colors duration-300">${category.name}</h4>
                                    ${category.name_fr ? `<p class="text-vintage-600 font-serif text-sm mt-1">${category.name_fr}</p>` : ''}
                                </div>
                            </div>
                        `}
                    </div>
                    
                    <div class="p-6">
                        <p class="text-vintage-700 leading-relaxed font-serif mb-4">
                            ${category.description || 'Carefully crafted traditional beverages'}
                        </p>
                        
                        <div class="flex items-center justify-between pt-4 border-t border-vintage-300">
                            <span class="text-vintage-600 font-serif text-sm">Browse category</span>
                            <div class="flex items-center text-vintage-700 group-hover:text-vintage-800 transition-colors duration-300">
                                <span class="font-serif font-semibold mr-2">View Menu</span>
                                <svg class="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path>
                                </svg>
                            </div>
                        </div>
                    </div>
                </a>
            `).join('')}
        </div>
    `;
    
    menuContainer.innerHTML = categoriesHTML;
}

// 渲染菜单项目
function renderMenuItems(items) {
    const menuContainer = document.getElementById('menu-categories');
    
    if (!items || items.length === 0) {
        menuContainer.innerHTML = `
            <div class="text-center py-20">
                <div class="w-24 h-24 bg-vintage-300 rounded-full flex items-center justify-center mx-auto mb-6 border-4 border-vintage-400 animate-gentle-float">
                    <svg class="w-12 h-12 text-vintage-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
                    </svg>
                </div>
                <h3 class="text-3xl font-script font-bold text-vintage-700 mb-4">No Items Available</h3>
                <p class="text-vintage-700 text-lg font-serif">This category currently has no items. Please check other categories or try again later.</p>
            </div>
        `;
        return;
    }
    
    const itemsHTML = `
        <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            ${items.map((item, index) => renderMenuItem(item, index)).join('')}
        </div>
    `;
    
    menuContainer.innerHTML = itemsHTML;
    
    // 初始化收藏按钮状态
    setTimeout(() => {
        initializeFavoriteButtons();
        initializeSizeSelectors();
    }, 100); // 延迟100ms确保DOM完全渲染
}

// 渲染单个菜单项目
function renderMenuItem(item, index) {
    // 解析杯型选项
    const sizeOptions = item.size_options || { sizes: [], uniform_price: true };
    const hasSizes = sizeOptions.sizes && sizeOptions.sizes.length > 0;
    const isUniformPrice = sizeOptions.uniform_price;
    
    // 生成杯型选择器HTML
    let sizeSelector = '';
    if (hasSizes) {
        if (isUniformPrice) {
            // 统一价格模式
            sizeSelector = `
                <div class="mb-4">
                    <p class="text-sm font-serif font-semibold text-vintage-700 mb-2">Available Sizes:</p>
                    <div class="flex flex-wrap gap-2">
                        ${sizeOptions.sizes.map((size, sizeIndex) => `
                            <span class="size-tag px-3 py-1 bg-vintage-200 text-vintage-700 border border-vintage-300 text-sm font-serif ${sizeIndex === 0 ? 'selected' : ''}"
                                  data-size="${size}" data-price="${item.price}">
                                ${size}
                            </span>
                        `).join('')}
                    </div>
                    <p class="text-vintage-600 text-xs mt-1 font-serif">All sizes: $${item.price.toFixed(2)}</p>
                </div>
            `;
        } else {
            // 差异化价格模式
            const sortedSizes = [...sizeOptions.sizes].sort((a, b) => a.price - b.price);
            sizeSelector = `
                <div class="mb-3">
                    <p class="text-xs font-serif font-semibold text-vintage-700 mb-1.5">Size & Price:</p>
                    <div class="flex flex-wrap gap-1.5">
                        ${sortedSizes.map((sizeObj, sizeIndex) => `
                            <label class="size-option-compact flex-shrink-0 px-2 py-1 border border-vintage-300 cursor-pointer hover:bg-vintage-200 transition-colors text-center ${sizeIndex === 0 ? 'selected' : ''}"
                                   data-size="${sizeObj.name}" data-price="${sizeObj.price}">
                                <input type="radio" name="size-${item.id}" value="${sizeObj.name}" class="hidden"
                                       ${sizeIndex === 0 ? 'checked' : ''}>
                                <div class="text-xs font-serif font-semibold text-vintage-700">${sizeObj.name}</div>
                                <div class="text-xs font-script font-bold text-vintage-800">$${sizeObj.price.toFixed(2)}</div>
                            </label>
                        `).join('')}
                    </div>
                </div>
            `;
        }
    }
    
    // 获取显示价格
    let displayPrice = item.price.toFixed(2);
    let priceLabel = '';
    
    if (hasSizes && !isUniformPrice) {
        const prices = sizeOptions.sizes.map(s => s.price);
        const minPrice = Math.min(...prices);
        const maxPrice = Math.max(...prices);
        displayPrice = minPrice === maxPrice ? minPrice.toFixed(2) : `${minPrice.toFixed(2)} - ${maxPrice.toFixed(2)}`;
        priceLabel = minPrice === maxPrice ? '' : 'from';
    }

    return `
        <div class="bg-vintage-50 border-2 border-vintage-300 shadow-lg hover:shadow-xl transition-shadow duration-300 animate-fade-in flex flex-col h-full" style="animation-delay: ${index * 0.1}s;">
            ${item.image_url ? `
                <div class="relative h-56 overflow-hidden border-b-2 border-vintage-300 flex-shrink-0">
                    <img src="${item.image_url}" alt="${item.name}" 
                         class="w-full h-full object-cover hover:scale-105 transition-transform duration-500">
                    <div class="absolute inset-0 bg-gradient-to-t from-vintage-900/20 to-transparent"></div>
                    
                    <!-- 收藏按钮 -->
                    <button class="absolute top-4 left-4 favorite-btn w-10 h-10 bg-vintage-50/90 hover:bg-vintage-100 border-2 border-vintage-400 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 shadow-lg" 
                            data-item-id="${item.id}" 
                            title="Add to favorites">
                        <svg class="w-5 h-5 text-vintage-700 favorite-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
                        </svg>
                    </button>
                    
                    ${item.is_featured ? `
                        <div class="absolute top-4 right-4">
                            <div class="bg-vintage-700 text-vintage-100 px-3 py-1 border border-vintage-500 shadow-lg">
                                <div class="flex items-center space-x-1">
                                    <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                                    </svg>
                                    <span class="text-xs font-serif font-bold">Featured</span>
                                </div>
                            </div>
                        </div>
                    ` : ''}
                </div>
            ` : `
                <div class="relative h-56 bg-gradient-to-br from-vintage-200 to-vintage-300 flex items-center justify-center border-b-2 border-vintage-300 vintage-paper flex-shrink-0">
                    <!-- 收藏按钮 -->
                    <button class="absolute top-4 left-4 favorite-btn w-10 h-10 bg-vintage-50/90 hover:bg-vintage-100 border-2 border-vintage-400 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 shadow-lg" 
                            data-item-id="${item.id}" 
                            title="Add to favorites">
                        <svg class="w-5 h-5 text-vintage-700 favorite-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
                        </svg>
                    </button>
                    
                    <div class="text-center">
                        <svg class="w-16 h-16 text-vintage-600 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                                  d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path>
                        </svg>
                        <p class="text-vintage-700 font-serif font-semibold text-sm">${item.name}</p>
                    </div>
                    ${item.is_featured ? `
                        <div class="absolute top-4 right-4">
                            <div class="bg-vintage-700 text-vintage-100 px-3 py-1 border border-vintage-500 shadow-lg">
                                <div class="flex items-center space-x-1">
                                    <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                                    </svg>
                                    <span class="text-xs font-serif font-bold">Featured</span>
                                </div>
                            </div>
                        </div>
                    ` : ''}
                </div>
            `}
            
            <!-- 内容区域：占用剩余空间 -->
            <div class="p-6 flex flex-col flex-1">
                <!-- 上半部分：可变内容 -->
                <div class="flex-1">
                    <div class="mb-4">
                        <h4 class="text-xl font-script font-bold text-vintage-800 mb-1">${item.name}</h4>
                        ${item.name_fr ? `<p class="text-sm text-vintage-600 font-serif italic">${item.name_fr}</p>` : ''}
                        
                        <!-- 装饰性分隔线 -->
                        <div class="flex items-center mt-2 mb-3">
                            <div class="h-px bg-vintage-400 w-8"></div>
                            <div class="mx-2 text-vintage-400 text-xs">❦</div>
                            <div class="h-px bg-vintage-400 flex-1"></div>
                        </div>
                    </div>
                    
                    ${item.description ? `
                        <p class="text-vintage-700 text-sm mb-4 leading-relaxed font-serif">${item.description}</p>
                    ` : ''}
                    
                    ${item.notes ? `
                        <div class="mb-4 p-3 bg-vintage-100 border border-vintage-300">
                            <div class="flex items-start space-x-2">
                                <svg class="w-4 h-4 text-vintage-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                </svg>
                                <p class="text-vintage-700 text-xs font-serif italic">${item.notes}</p>
                            </div>
                        </div>
                    ` : ''}
                    
                    ${sizeSelector}
                </div>
                
                <!-- 下半部分：价格和按钮 - 始终在底部 -->
                <div class="flex justify-between items-center pt-4 border-t border-vintage-300 mt-auto">
                    <div class="flex items-baseline space-x-1">
                        <span class="text-2xl font-script font-bold text-vintage-800 item-price">$${displayPrice}</span>
                        ${priceLabel ? `<span class="text-sm text-vintage-600 font-serif">${priceLabel}</span>` : ''}
                    </div>
                    <!-- 删除Order Now按钮，这里不再显示任何按钮 -->
                </div>
            </div>
        </div>
    `;
}

// 初始化杯型选择器
function initializeSizeSelectors() {
    // 处理老式的size-option（如果还有的话）
    const sizeOptions = document.querySelectorAll('.size-option');
    sizeOptions.forEach(option => {
        option.addEventListener('click', function() {
            const name = this.getAttribute('name') || this.closest('.size-option').querySelector('input[type="radio"]')?.name;
            if (name) {
                // 清除同组其他选项的选中状态
                document.querySelectorAll(`input[name="${name}"]`).forEach(radio => {
                    radio.checked = false;
                    radio.closest('.size-option').classList.remove('selected');
                    radio.closest('.size-option').querySelector('.radio-dot')?.classList.add('hidden');
                });
            }
            
            // 设置当前选项为选中状态
            this.classList.add('selected');
            const radio = this.querySelector('input[type="radio"]');
            if (radio) {
                radio.checked = true;
                this.querySelector('.radio-dot')?.classList.remove('hidden');
            }
            
            // 更新价格显示
            const price = this.dataset.price;
            const priceElement = this.closest('.bg-vintage-50').querySelector('.item-price');
            if (priceElement && price) {
                priceElement.textContent = `$${parseFloat(price).toFixed(2)}`;
            }
        });
    });
    
    // 处理新的紧凑样式size-option-compact
    const compactSizeOptions = document.querySelectorAll('.size-option-compact');
    compactSizeOptions.forEach(option => {
        option.addEventListener('click', function() {
            const radio = this.querySelector('input[type="radio"]');
            const name = radio?.name;
            
            if (name) {
                // 清除同组其他选项的选中状态
                document.querySelectorAll(`input[name="${name}"]`).forEach(r => {
                    r.checked = false;
                    r.closest('.size-option-compact').classList.remove('selected');
                });
            }
            
            // 设置当前选项为选中状态
            this.classList.add('selected');
            if (radio) {
                radio.checked = true;
            }
            
            // 更新价格显示
            const price = this.dataset.price;
            const priceElement = this.closest('.bg-vintage-50').querySelector('.item-price');
            if (priceElement && price) {
                priceElement.textContent = `$${parseFloat(price).toFixed(2)}`;
            }
        });
    });
    
    // 为统一价格的标签添加点击效果
    const sizeTags = document.querySelectorAll('.size-tag');
    sizeTags.forEach(tag => {
        tag.addEventListener('click', function() {
            // 清除同容器内其他标签的选中状态
            this.parentElement.querySelectorAll('.size-tag').forEach(t => t.classList.remove('selected', 'bg-vintage-700', 'text-vintage-100'));
            // 设置当前标签为选中状态
            this.classList.add('selected', 'bg-vintage-700', 'text-vintage-100');
            this.classList.remove('bg-vintage-200', 'text-vintage-700');
        });
    });
}

// 显示错误信息
function showError() {
    const menuContainer = document.getElementById('menu-categories');
    const categoryNav = document.getElementById('category-nav');
    
    if (categoryNav) {
        categoryNav.innerHTML = `
            <div class="text-center py-4">
                <p class="text-vintage-400 font-serif">Loading failed</p>
            </div>
        `;
    }
    
    if (menuContainer) {
        menuContainer.innerHTML = `
            <div class="text-center py-20">
                <div class="w-24 h-24 bg-vintage-400 rounded-full flex items-center justify-center mx-auto mb-6 border-4 border-vintage-500">
                    <svg class="w-12 h-12 text-vintage-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                </div>
                <h3 class="text-3xl font-script font-bold text-vintage-700 mb-4">Loading Failed</h3>
                <p class="text-vintage-700 text-lg font-serif mb-6">Unable to load menu information. Please check your network connection.</p>
                <button onclick="location.reload()" class="px-8 py-3 bg-vintage-700 hover:bg-vintage-800 text-vintage-100 border-2 border-vintage-600 font-serif font-semibold transition-colors duration-300">
                    Reload Page
                </button>
            </div>
        `;
    }
}

// 初始化复古效果
function initializeVintageEffects() {
    // 平滑滚动
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                const offsetTop = target.offsetTop - 80; // 为固定导航栏留出空间
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        });
    });

    // 复古动画观察器
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -20px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-fade-in');
            }
        });
    }, observerOptions);

    // 延迟观察元素，等待内容加载
    setTimeout(() => {
        document.querySelectorAll('section').forEach(el => {
            observer.observe(el);
        });
    }, 1000);

    // 添加复古纸张效果
    addVintageEffects();
}

// 添加复古视觉效果
function addVintageEffects() {
    // 随机添加咖啡渍效果
    const addCoffeeStains = () => {
        const sections = document.querySelectorAll('section');
        sections.forEach(section => {
            if (Math.random() > 0.8) { // 20% 概率添加咖啡渍
                const stain = document.createElement('div');
                stain.className = 'absolute w-12 h-12 coffee-stain rounded-full pointer-events-none opacity-30';
                stain.style.top = Math.random() * 80 + '%';
                stain.style.right = Math.random() * 80 + '%';
                section.style.position = 'relative';
                section.appendChild(stain);
            }
        });
    };

    // 延迟添加效果
    setTimeout(addCoffeeStains, 1500);
}

// 初始化收藏按钮状态和事件
async function initializeFavoriteButtons() {
    console.log('Initializing favorite buttons...');
    const favoriteButtons = document.querySelectorAll('.favorite-btn');
    console.log(`Found ${favoriteButtons.length} favorite buttons`);
    
    // 为每个收藏按钮添加点击事件
    favoriteButtons.forEach((button, index) => {
        console.log(`Adding click event for button ${index + 1}`);
        button.addEventListener('click', handleFavoriteClick);
    });
    
    // 如果用户已登录，更新收藏状态
    if (authManager && authManager.isAuthenticated()) {
        console.log('User is authenticated, updating favorite states');
        await updateFavoriteStates();
    } else {
        console.log('User not authenticated or authManager undefined');
    }
}

// 处理收藏按钮点击
async function handleFavoriteClick(event) {
    console.log('Favorite button clicked!');
    event.preventDefault();
    event.stopPropagation();
    
    const button = event.currentTarget;
    const itemId = parseInt(button.dataset.itemId);
    const icon = button.querySelector('.favorite-icon');
    
    console.log(`Clicked item ID: ${itemId}`);
    
    // 检查用户是否已登录
    if (!authManager || !authManager.isAuthenticated()) {
        console.log('User not authenticated, showing login prompt');
        showFavoriteLoginPrompt();
        return;
    }
    
    // 禁用按钮防止重复点击
    button.disabled = true;
    
    try {
        // 检查当前是否已收藏
        const isFavorited = await favoritesManager.isFavorite(itemId);
        
        if (isFavorited) {
            // 移除收藏
            const result = await favoritesManager.removeFavorite(itemId);
            if (result.success) {
                updateFavoriteButtonState(button, false);
                showFavoriteMessage('Removed from favorites', 'success');
            } else {
                showFavoriteMessage('Failed to remove from favorites', 'error');
            }
        } else {
            // 添加收藏
            const result = await favoritesManager.addFavorite(itemId);
            if (result.success) {
                updateFavoriteButtonState(button, true);
                showFavoriteMessage('Added to favorites', 'success');
            } else {
                showFavoriteMessage('Failed to add to favorites', 'error');
            }
        }
    } catch (error) {
        console.error('Favorite operation failed:', error);
        showFavoriteMessage('Operation failed, please try again', 'error');
    } finally {
        button.disabled = false;
    }
}

// 更新收藏按钮状态
function updateFavoriteButtonState(button, isFavorited) {
    const icon = button.querySelector('.favorite-icon');
    
    if (isFavorited) {
        // 已收藏状态
        icon.setAttribute('fill', 'currentColor');
        icon.setAttribute('stroke', 'none');
        button.classList.add('bg-vintage-600', 'text-vintage-100');
        button.classList.remove('bg-vintage-50/90', 'text-vintage-700');
        button.title = 'Remove from favorites';
    } else {
        // 未收藏状态
        icon.setAttribute('fill', 'none');
        icon.setAttribute('stroke', 'currentColor');
        button.classList.remove('bg-vintage-600', 'text-vintage-100');
        button.classList.add('bg-vintage-50/90', 'text-vintage-700');
        button.title = 'Add to favorites';
    }
}

// 更新所有收藏按钮状态
async function updateFavoriteStates() {
    const favoriteButtons = document.querySelectorAll('.favorite-btn');
    
    for (const button of favoriteButtons) {
        const itemId = parseInt(button.dataset.itemId);
        try {
            const isFavorited = await favoritesManager.isFavorite(itemId);
            updateFavoriteButtonState(button, isFavorited);
        } catch (error) {
            console.error(`Error updating favorite state for item ${itemId}:`, error);
        }
    }
}

// 显示收藏登录提示
function showFavoriteLoginPrompt() {
    const existingModal = document.getElementById('favorite-login-modal');
    if (existingModal) {
        existingModal.remove();
    }
    
    const modal = document.createElement('div');
    modal.id = 'favorite-login-modal';
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
    modal.innerHTML = `
        <div class="bg-vintage-50 border-2 border-vintage-400 shadow-2xl max-w-md mx-4 animate-fade-in">
            <div class="p-6 text-center">
                <div class="w-16 h-16 bg-vintage-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg class="w-8 h-8 text-vintage-100" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
                    </svg>
                </div>
                <h4 class="text-xl font-script font-bold text-vintage-800 mb-3">Sign In to Save Favorites</h4>
                <p class="text-vintage-700 font-serif mb-6">Create an account or sign in to save your favorite items and access them anytime.</p>
                <div class="flex space-x-3">
                    <button onclick="document.getElementById('favorite-login-modal').remove()" 
                            class="flex-1 px-4 py-2 border border-vintage-400 text-vintage-700 hover:bg-vintage-100 font-serif transition-colors">
                        Cancel
                    </button>
                    <a href="login.html" 
                       class="flex-1 px-4 py-2 bg-vintage-700 hover:bg-vintage-800 text-vintage-100 font-serif text-center transition-colors">
                        Sign In
                    </a>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // 点击模态框外部关闭
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.remove();
        }
    });
}

// 显示收藏操作消息
function showFavoriteMessage(message, type = 'success') {
    // 移除现有消息
    const existingMessage = document.getElementById('favorite-message');
    if (existingMessage) {
        existingMessage.remove();
    }
    
    const messageDiv = document.createElement('div');
    messageDiv.id = 'favorite-message';
    messageDiv.className = `fixed top-20 right-4 z-50 px-6 py-3 border-2 shadow-lg animate-fade-in ${
        type === 'success' 
        ? 'bg-green-50 border-green-400 text-green-800' 
        : 'bg-red-50 border-red-400 text-red-800'
    }`;
    messageDiv.innerHTML = `
        <div class="flex items-center space-x-2">
            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                ${type === 'success' 
                ? '<path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>'
                : '<path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path>'
                }
            </svg>
            <span class="font-serif font-semibold">${message}</span>
        </div>
    `;
    
    document.body.appendChild(messageDiv);
    
    // 3秒后自动移除
    setTimeout(() => {
        if (messageDiv.parentNode) {
            messageDiv.remove();
        }
    }, 3000);
}

// 添加导航栏滚动效果
window.addEventListener('scroll', () => {
    const nav = document.querySelector('nav');
    if (window.scrollY > 100) {
        nav.classList.add('bg-white/95');
        nav.classList.remove('glass');
    } else {
        nav.classList.remove('bg-white/95');
        nav.classList.add('glass');
    }
});

// 随机选择饮品功能
async function pickRandomDrink() {
    try {
        // 显示加载动画
        showRandomDrinkModal(null, true);
        
        // 获取所有分类的所有饮品
        const allItems = [];
        for (const category of allCategories) {
            const items = await getMenuItems(category.id);
            items.forEach(item => {
                allItems.push({
                    ...item,
                    category: category
                });
            });
        }
        
        if (allItems.length === 0) {
            showFavoriteMessage('No drinks available', 'error');
            closeRandomDrinkModal();
            return;
        }
        
        // 随机选择一个饮品
        const randomIndex = Math.floor(Math.random() * allItems.length);
        const selectedDrink = allItems[randomIndex];
        
        // 显示选中的饮品
        setTimeout(() => {
            showRandomDrinkModal(selectedDrink);
        }, 800); // 延迟显示，增加悬念感
        
    } catch (error) {
        console.error('Error picking random drink:', error);
        showFavoriteMessage('Failed to pick a drink', 'error');
        closeRandomDrinkModal();
    }
}

// 显示随机饮品模态框
function showRandomDrinkModal(drink, isLoading = false) {
    // 移除现有模态框
    const existingModal = document.getElementById('random-drink-modal');
    if (existingModal) {
        existingModal.remove();
    }
    
    const modal = document.createElement('div');
    modal.id = 'random-drink-modal';
    modal.className = 'fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4';
    
    if (isLoading) {
        // 加载状态
        modal.innerHTML = `
            <div class="bg-vintage-50 rounded-lg shadow-2xl max-w-md w-full p-8 text-center animate-fade-in">
                <div class="w-20 h-20 bg-vintage-300 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                    <svg class="w-10 h-10 text-vintage-700 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path>
                    </svg>
                </div>
                <h3 class="text-2xl font-script font-bold text-vintage-700">Choosing the perfect drink for you...</h3>
            </div>
        `;
    } else if (drink) {
        // 显示选中的饮品
        const sizeOptions = drink.size_options || { sizes: [], uniform_price: true };
        const hasSizes = sizeOptions.sizes && sizeOptions.sizes.length > 0;
        const isUniformPrice = sizeOptions.uniform_price;
        
        let sizeSelector = '';
        let displayPrice = drink.price.toFixed(2);
        
        if (hasSizes) {
            if (isUniformPrice) {
                sizeSelector = `
                    <div class="mb-4">
                        <p class="text-sm font-serif font-semibold text-vintage-700 mb-2">Size & Price:</p>
                        <div class="flex justify-center space-x-2">
                            ${sizeOptions.sizes.map((size, index) => `
                                <label class="size-option px-4 py-2 border-2 border-vintage-300 cursor-pointer hover:bg-vintage-200 transition-colors ${index === 0 ? 'selected' : ''}">
                                    <input type="radio" name="modal-size" value="${size}" class="hidden" ${index === 0 ? 'checked' : ''}>
                                    <div class="text-center">
                                        <p class="font-serif font-semibold text-vintage-700">${size}</p>
                                        <p class="font-script font-bold text-vintage-800">$${drink.price.toFixed(2)}</p>
                                    </div>
                                </label>
                            `).join('')}
                        </div>
                    </div>
                `;
            } else {
                const sortedSizes = [...sizeOptions.sizes].sort((a, b) => a.price - b.price);
                const prices = sortedSizes.map(s => s.price);
                const minPrice = Math.min(...prices);
                const maxPrice = Math.max(...prices);
                displayPrice = `${minPrice.toFixed(2)} - ${maxPrice.toFixed(2)}`;
                
                sizeSelector = `
                    <div class="mb-4">
                        <p class="text-sm font-serif font-semibold text-vintage-700 mb-2">Size & Price:</p>
                        <div class="flex justify-center space-x-2">
                            ${sortedSizes.map((sizeObj, index) => `
                                <label class="size-option px-4 py-2 border-2 border-vintage-300 cursor-pointer hover:bg-vintage-200 transition-colors ${index === 0 ? 'selected' : ''}"
                                       data-price="${sizeObj.price}">
                                    <input type="radio" name="modal-size" value="${sizeObj.name}" class="hidden" ${index === 0 ? 'checked' : ''}>
                                    <div class="text-center">
                                        <p class="font-serif font-semibold text-vintage-700">${sizeObj.name}</p>
                                        <p class="font-script font-bold text-vintage-800">$${sizeObj.price.toFixed(2)}</p>
                                    </div>
                                </label>
                            `).join('')}
                        </div>
                    </div>
                `;
            }
        }
        
        modal.innerHTML = `
            <div class="relative bg-vintage-50 rounded-lg shadow-2xl max-w-xl w-full max-h-[90vh] overflow-auto animate-fade-in"> <!-- max-w-2xl 改为 max-w-xl -->
                <!-- 关闭按钮 -->
                <button onclick="closeRandomDrinkModal()" class="absolute top-4 right-4 z-10 w-10 h-10 bg-vintage-700 hover:bg-vintage-800 text-white rounded-full flex items-center justify-center transition-colors duration-300">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                </button>
                
                <!-- 图片区域 -->
                ${drink.image_url ? `
                    <div class="relative h-64 overflow-hidden rounded-t-lg">
                        <img src="${drink.image_url}" alt="${drink.name}" class="w-full h-full object-cover">
                        <div class="absolute inset-0 bg-gradient-to-t from-vintage-900/50 to-transparent"></div>
                    </div>
                ` : `
                    <div class="h-64 bg-gradient-to-br from-vintage-200 to-vintage-300 flex items-center justify-center rounded-t-lg">
                        <svg class="w-24 h-24 text-vintage-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path>
                        </svg>
                    </div>
                `}
                <!-- 收藏按钮始终显示在图片区域的左上角 -->
                <button class="absolute top-4 left-4 favorite-btn w-10 h-10 bg-vintage-50/90 hover:bg-vintage-100 border-2 border-vintage-400 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 shadow-lg" 
                        data-item-id="${drink.id}" 
                        title="Add to favorites">
                    <svg class="w-5 h-5 text-vintage-700 favorite-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
                    </svg>
                </button>
                <div class="p-6">
                    <div class="text-center mb-4">
                        <h2 class="text-3xl font-script font-bold text-vintage-800 mb-2">${drink.name}</h2>
                        ${drink.name_fr ? `<p class="text-lg text-vintage-600 font-serif italic">${drink.name_fr}</p>` : ''}
                        <div class="flex items-center justify-center mt-3 mb-4">
                            <div class="h-px bg-vintage-400 w-16"></div>
                            <div class="mx-3 text-vintage-400">❦</div>
                            <div class="h-px bg-vintage-400 w-16"></div>
                        </div>
                    </div>
                    ${drink.description ? `
                        <p class="text-vintage-700 text-center mb-4 leading-relaxed font-serif">${drink.description}</p>
                    ` : ''}
                    <div class="text-center mb-4">
                        <span class="inline-block px-3 py-1 bg-vintage-200 text-vintage-700 text-sm font-serif border border-vintage-300">
                            ${drink.category.name}
                        </span>
                    </div>
                    ${sizeSelector}
                    <div class="flex justify-between items-center pt-4 border-t border-vintage-300">
                        <div class="flex items-baseline space-x-1">
                            <span class="text-2xl font-script font-bold text-vintage-800 modal-price">$${displayPrice}</span>
                            ${hasSizes && !isUniformPrice ? '<span class="text-sm text-vintage-600 font-serif">from</span>' : ''}
                        </div>
                        <button onclick="pickRandomDrink()" 
                                class="px-6 py-2 bg-vintage-700 hover:bg-vintage-800 text-vintage-100 font-serif font-semibold border border-vintage-600 transition-colors duration-300 hover:shadow-lg">
                            Pick Another
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        // 初始化模态框内的交互元素
        setTimeout(() => {
            // 初始化收藏按钮
            const favoriteBtn = modal.querySelector('.favorite-btn');
            if (favoriteBtn) {
                favoriteBtn.addEventListener('click', handleFavoriteClick);
                // 更新收藏状态
                if (authManager && authManager.isAuthenticated()) {
                    favoritesManager.isFavorite(drink.id).then(isFavorited => {
                        updateFavoriteButtonState(favoriteBtn, isFavorited);
                    });
                }
            }
            
            // 初始化杯型选择器
            const sizeOptions = modal.querySelectorAll('.size-option');
            sizeOptions.forEach(option => {
                option.addEventListener('click', function() {
                    // 清除其他选项的选中状态
                    sizeOptions.forEach(opt => opt.classList.remove('selected'));
                    // 设置当前选项为选中状态
                    this.classList.add('selected');
                    this.querySelector('input').checked = true;
                    
                    // 更新价格显示（如果有不同价格）
                    const price = this.dataset.price;
                    if (price) {
                        const priceElement = modal.querySelector('.modal-price');
                        if (priceElement) {
                            priceElement.textContent = `$${parseFloat(price).toFixed(2)}`;
                        }
                    }
                });
            });
        }, 100);
    }
    
    document.body.appendChild(modal);
    document.body.style.overflow = 'hidden'; // 防止背景滚动
    
    // 点击模态框背景关闭
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeRandomDrinkModal();
        }
    });
}

// 关闭随机饮品模态框
function closeRandomDrinkModal() {
    const modal = document.getElementById('random-drink-modal');
    if (modal) {
        modal.remove();
        document.body.style.overflow = ''; // 恢复滚动
    }
}

// 使函数在全局可用
window.pickRandomDrink = pickRandomDrink;
window.closeRandomDrinkModal = closeRandomDrinkModal; 