import { getPromotions, getHeritageCarousel } from './supabase-client.js';

// 页面加载完成后执行
document.addEventListener('DOMContentLoaded', async () => {
    await loadPromotions();
    await loadHeritageCarousel();
    initializeVintageEffects();
});

// 轮播器状态
let currentSlide = 0;
let carouselData = [];
let carouselInterval = null;

// 加载促销信息
async function loadPromotions() {
    const promotionsContainer = document.getElementById('promotions');
    
    // 如果页面没有促销信息容器，直接返回
    if (!promotionsContainer) {
        return;
    }
    
    try {
        const promotions = await getPromotions();
        
        if (promotions.length === 0) {
            promotionsContainer.innerHTML = `
                <div class="col-span-full text-center py-16">
                    <div class="w-20 h-20 bg-vintage-300 rounded-full flex items-center justify-center mx-auto mb-6 border-4 border-vintage-400">
                        <svg class="w-10 h-10 text-vintage-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                    </div>
                    <h4 class="text-2xl font-script font-bold text-vintage-700 mb-4">No Special Offers</h4>
                    <p class="text-vintage-600 font-serif">Please stay tuned for our latest updates, classic offers are coming soon!</p>
                </div>
            `;
            return;
        }
        
        promotionsContainer.innerHTML = promotions.map((promotion, index) => `
            <div class="bg-vintage-50 border-2 border-vintage-400 shadow-lg hover:shadow-xl transition-shadow duration-300 animate-fade-in flex flex-col h-full overflow-hidden" style="animation-delay: ${index * 0.2}s;">
                <!-- 装饰性顶部边框 -->
                <div class="h-2 bg-gradient-to-r from-vintage-600 via-vintage-700 to-vintage-600"></div>
                
                <!-- 图片容器 -->
                ${promotion.image_url ? `
                    <div class="relative h-48 overflow-hidden">
                        <img src="${promotion.image_url}" alt="${promotion.title}" class="w-full h-full object-cover transition-transform duration-300 hover:scale-105">
                        <div class="absolute inset-0 bg-gradient-to-t from-vintage-900/50 to-transparent"></div>
                    </div>
                ` : ''}
                
                <div class="p-8 flex-1 flex flex-col">
                    <div class="flex items-start space-x-4 mb-6">
                        <div class="w-16 h-16 bg-vintage-600 rounded-full flex items-center justify-center border-4 border-vintage-400 flex-shrink-0">
                            <svg class="w-8 h-8 text-vintage-100" fill="currentColor" viewBox="0 0 20 20">
                                <path fill-rule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clip-rule="evenodd"></path>
                            </svg>
                        </div>
                        <div class="flex-1">
                            <h4 class="text-2xl font-script font-bold text-vintage-800 mb-2">${promotion.title}</h4>
                            ${promotion.subtitle ? `
                                <p class="text-vintage-600 font-serif italic">${promotion.subtitle}</p>
                            ` : ''}
                            <!-- 装饰性分隔线 -->
                            <div class="flex items-center mt-3 mb-4">
                                <div class="h-px bg-vintage-500 w-12"></div>
                                <div class="mx-2 text-vintage-500 text-sm">❦</div>
                                <div class="h-px bg-vintage-500 w-12"></div>
                            </div>
                        </div>
                    </div>
                    
                    <p class="text-vintage-700 leading-relaxed mb-6 font-serif text-lg flex-1">${promotion.description}</p>
                    
                    <div class="flex flex-wrap items-center gap-4 mb-6">
                        ${promotion.badge_text ? `
                            <div class="inline-flex items-center bg-vintage-700 text-vintage-100 px-6 py-3 border-2 border-vintage-600 shadow-lg">
                                <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                    <path fill-rule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clip-rule="evenodd"></path>
                                </svg>
                                <span class="font-serif font-bold">${promotion.badge_text}</span>
                            </div>
                        ` : ''}
                        
                        ${promotion.start_date || promotion.end_date ? `
                            <div class="inline-flex items-center bg-vintage-200 text-vintage-800 px-4 py-2 border border-vintage-400">
                                <svg class="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
                                </svg>
                                <span class="font-serif font-semibold text-sm">Limited Time Offer</span>
                            </div>
                        ` : ''}
                    </div>
                    
                    ${promotion.end_date ? `
                        <div class="border-t border-vintage-300 pt-4">
                            <div class="flex items-center justify-between text-sm">
                                <div class="flex items-center space-x-2">
                                    <svg class="w-4 h-4 text-vintage-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                    </svg>
                                    <span class="font-serif font-semibold text-vintage-700">Offer Expires</span>
                                </div>
                                <span class="font-serif font-bold text-vintage-800">${new Date(promotion.end_date).toLocaleDateString('zh-CN', { 
                                    year: 'numeric', 
                                    month: 'long', 
                                    day: 'numeric' 
                                })}</span>
                            </div>
                        </div>
                    ` : ''}
                </div>
                
                <!-- 装饰性底部边框 -->
                <div class="h-2 bg-gradient-to-r from-vintage-600 via-vintage-700 to-vintage-600"></div>
            </div>
        `).join('');
        
    } catch (error) {
        console.error('加载促销信息时出错:', error);
        if (promotionsContainer) {
            promotionsContainer.innerHTML = `
            <div class="col-span-full text-center py-16">
                <div class="w-20 h-20 bg-vintage-400 rounded-full flex items-center justify-center mx-auto mb-6 border-4 border-vintage-500">
                    <svg class="w-10 h-10 text-vintage-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                </div>
                <h4 class="text-2xl font-script font-bold text-vintage-700 mb-4">Loading Failed</h4>
                <p class="text-vintage-600 font-serif mb-6">Unable to get offer information, please try again later or refresh the page</p>
                <button onclick="location.reload()" class="px-8 py-3 bg-vintage-700 hover:bg-vintage-800 text-vintage-100 border-2 border-vintage-600 font-serif font-semibold transition-colors duration-300">
                    Reload
                </button>
            </div>
        `;
        }
    }
}

// 加载传承轮播器数据
async function loadHeritageCarousel() {
    try {
        carouselData = await getHeritageCarousel();
        if (carouselData.length > 0) {
            initializeCarousel();
            startAutoCarousel();
        }
    } catch (error) {
        console.error('加载传承轮播器失败:', error);
    }
}

// 初始化轮播器
function initializeCarousel() {
    const carouselContent = document.getElementById('carousel-content');
    const carouselDots = document.getElementById('carousel-dots');
    const carouselLoading = document.getElementById('carousel-loading');
    
    // 隐藏加载状态
    carouselLoading.style.display = 'none';
    
    // 创建轮播项目
    carouselContent.innerHTML = carouselData.map((item, index) => `
        <div class="carousel-slide absolute inset-0 transition-all duration-700 ease-in-out ${index === 0 ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-full'}" data-slide="${index}">
            <div class="relative h-full">
                <!-- 背景图片 -->
                <div class="absolute inset-0 bg-cover bg-center" style="background-image: url('${item.image_url}');">
                    <div class="absolute inset-0 bg-vintage-900 bg-opacity-40"></div>
                </div>
                
                <!-- 内容覆盖层 -->
                <div class="relative h-full flex items-center justify-center">
                    <div class="text-center text-white px-8 max-w-3xl">
                        <!-- 装饰性分隔线 -->
                        <div class="flex items-center justify-center mb-6">
                            <div class="h-px bg-vintage-200 w-16"></div>
                            <div class="mx-4 text-vintage-200">❦</div>
                            <div class="h-px bg-vintage-200 w-16"></div>
                        </div>
                        
                        <h4 class="text-3xl md:text-4xl font-script font-bold mb-4 text-vintage-100">${item.title}</h4>
                        <p class="text-xl md:text-2xl font-serif italic mb-6 text-vintage-200">${item.subtitle}</p>
                        <p class="text-lg leading-relaxed font-serif text-vintage-100 max-w-2xl mx-auto">${item.description}</p>
                        
                        <!-- 装饰性分隔线 -->
                        <div class="flex items-center justify-center mt-6">
                            <div class="h-px bg-vintage-200 w-12"></div>
                            <div class="mx-3 text-vintage-200">❦</div>
                            <div class="h-px bg-vintage-200 w-12"></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `).join('');
    
    // 创建导航点
    carouselDots.innerHTML = carouselData.map((_, index) => `
        <button class="carousel-dot w-3 h-3 rounded-full transition-all duration-300 ${index === 0 ? 'bg-vintage-100 w-8' : 'bg-vintage-400'}" data-slide="${index}"></button>
    `).join('');
    
    // 绑定导航事件
    bindCarouselEvents();
}

// 绑定轮播器事件
function bindCarouselEvents() {
    // 导航点点击事件
    document.querySelectorAll('.carousel-dot').forEach(dot => {
        dot.addEventListener('click', (e) => {
            const slideIndex = parseInt(e.target.dataset.slide);
            goToSlide(slideIndex);
        });
    });
    
    // 左右箭头点击事件
    document.getElementById('carousel-prev').addEventListener('click', prevSlide);
    document.getElementById('carousel-next').addEventListener('click', nextSlide);
    
    // 鼠标悬停时暂停自动轮播
    const carousel = document.getElementById('heritage-carousel');
    carousel.addEventListener('mouseenter', stopAutoCarousel);
    carousel.addEventListener('mouseleave', startAutoCarousel);
}

// 切换到指定幻灯片
function goToSlide(slideIndex) {
    if (slideIndex === currentSlide || slideIndex < 0 || slideIndex >= carouselData.length) return;
    
    const slides = document.querySelectorAll('.carousel-slide');
    const dots = document.querySelectorAll('.carousel-dot');
    
    // 更新当前幻灯片样式
    slides[currentSlide].classList.remove('opacity-100', 'translate-x-0');
    slides[currentSlide].classList.add('opacity-0', 'translate-x-full');
    dots[currentSlide].classList.remove('bg-vintage-100', 'w-8');
    dots[currentSlide].classList.add('bg-vintage-400');
    
    // 更新新幻灯片样式
    slides[slideIndex].classList.remove('opacity-0', 'translate-x-full');
    slides[slideIndex].classList.add('opacity-100', 'translate-x-0');
    dots[slideIndex].classList.remove('bg-vintage-400');
    dots[slideIndex].classList.add('bg-vintage-100', 'w-8');
    
    currentSlide = slideIndex;
}

// 下一张幻灯片
function nextSlide() {
    const nextIndex = (currentSlide + 1) % carouselData.length;
    goToSlide(nextIndex);
}

// 上一张幻灯片
function prevSlide() {
    const prevIndex = (currentSlide - 1 + carouselData.length) % carouselData.length;
    goToSlide(prevIndex);
}

// 开始自动轮播
function startAutoCarousel() {
    stopAutoCarousel(); // 确保没有重复的定时器
    if (carouselData.length > 1) {
        carouselInterval = setInterval(nextSlide, 3000); // 每3秒切换
    }
}

// 停止自动轮播
function stopAutoCarousel() {
    if (carouselInterval) {
        clearInterval(carouselInterval);
        carouselInterval = null;
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
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
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

    // 观察需要动画的元素
    document.querySelectorAll('section > div').forEach(el => {
        observer.observe(el);
    });

    // 添加复古纸张效果
    addVintageEffects();
}

// 添加复古视觉效果
function addVintageEffects() {
    // 随机添加咖啡渍效果
    const addCoffeeStains = () => {
        const sections = document.querySelectorAll('section');
        sections.forEach(section => {
            if (Math.random() > 0.7) { // 30% 概率添加咖啡渍
                const stain = document.createElement('div');
                stain.className = 'absolute w-16 h-16 coffee-stain rounded-full pointer-events-none opacity-50';
                stain.style.top = Math.random() * 80 + '%';
                stain.style.left = Math.random() * 80 + '%';
                section.style.position = 'relative';
                section.appendChild(stain);
            }
        });
    };

    // 延迟添加效果，避免影响初始加载
    setTimeout(addCoffeeStains, 1000);
}

// 添加导航栏滚动效果
window.addEventListener('scroll', () => {
    const nav = document.querySelector('nav');
    if (window.scrollY > 100) {
        nav.classList.add('bg-white/90');
        nav.classList.remove('glass');
    } else {
        nav.classList.remove('bg-white/90');
        nav.classList.add('glass');
    }
});

// 初始化移动端菜单
function initializeMobileMenu() {
    console.log('Initializing mobile menu...');
    
    const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
    const mobileMenu = document.getElementById('mobile-menu');
    const mobileMenuIcon = document.getElementById('mobile-menu-icon');
    const mobileMenuClose = document.getElementById('mobile-menu-close');
    
    console.log('Mobile menu elements:', { mobileMenuToggle, mobileMenu, mobileMenuIcon, mobileMenuClose });
    
    if (mobileMenuToggle && mobileMenu) {
        console.log('Adding click event listener to mobile menu toggle');
        
        // 移除可能存在的旧事件监听器
        mobileMenuToggle.replaceWith(mobileMenuToggle.cloneNode(true));
        const newMobileMenuToggle = document.getElementById('mobile-menu-toggle');
        
        newMobileMenuToggle.addEventListener('click', (e) => {
            console.log('Mobile menu toggle clicked!');
            e.preventDefault();
            e.stopPropagation();
            toggleMobileMenu();
        });
        
        // 点击菜单项后关闭菜单
        const menuItems = mobileMenu.querySelectorAll('a');
        console.log(`Found ${menuItems.length} menu items`);
        menuItems.forEach(item => {
            item.addEventListener('click', () => {
                console.log('Menu item clicked, closing menu');
                closeMobileMenu();
            });
        });
        
        // 点击页面其他地方关闭菜单
        document.addEventListener('click', (e) => {
            if (!newMobileMenuToggle.contains(e.target) && !mobileMenu.contains(e.target)) {
                closeMobileMenu();
            }
        });
        
        console.log('Mobile menu initialization completed');
    } else {
        console.error('Mobile menu elements not found!');
    }
}

// 切换移动端菜单
function toggleMobileMenu() {
    console.log('Toggle mobile menu called');
    const mobileMenu = document.getElementById('mobile-menu');
    const mobileMenuIcon = document.getElementById('mobile-menu-icon');
    const mobileMenuClose = document.getElementById('mobile-menu-close');
    
    console.log('Current menu state - hidden:', mobileMenu?.classList.contains('hidden'));
    
    if (mobileMenu && mobileMenu.classList.contains('hidden')) {
        console.log('Opening mobile menu');
        openMobileMenu();
    } else {
        console.log('Closing mobile menu');
        closeMobileMenu();
    }
}

// 打开移动端菜单
function openMobileMenu() {
    console.log('Opening mobile menu');
    const mobileMenu = document.getElementById('mobile-menu');
    const mobileMenuIcon = document.getElementById('mobile-menu-icon');
    const mobileMenuClose = document.getElementById('mobile-menu-close');
    
    if (mobileMenu) {
        mobileMenu.classList.remove('hidden');
        console.log('Removed hidden class from mobile menu');
    }
    if (mobileMenuIcon) {
        mobileMenuIcon.classList.add('hidden');
        console.log('Added hidden class to menu icon');
    }
    if (mobileMenuClose) {
        mobileMenuClose.classList.remove('hidden');
        console.log('Removed hidden class from close icon');
    }
}

// 关闭移动端菜单
function closeMobileMenu() {
    console.log('Closing mobile menu');
    const mobileMenu = document.getElementById('mobile-menu');
    const mobileMenuIcon = document.getElementById('mobile-menu-icon');
    const mobileMenuClose = document.getElementById('mobile-menu-close');
    
    if (mobileMenu) {
        mobileMenu.classList.add('hidden');
        console.log('Added hidden class to mobile menu');
    }
    if (mobileMenuIcon) {
        mobileMenuIcon.classList.remove('hidden');
        console.log('Removed hidden class from menu icon');
    }
    if (mobileMenuClose) {
        mobileMenuClose.classList.add('hidden');
        console.log('Added hidden class to close icon');
    }
}

// 导出函数以便其他页面使用
export { initializeMobileMenu, toggleMobileMenu, openMobileMenu, closeMobileMenu }; 