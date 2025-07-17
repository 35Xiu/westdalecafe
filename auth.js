import { supabase } from './supabase-client.js';

// 认证状态管理
class AuthManager {
    constructor() {
        this.currentUser = null;
        this.authListeners = [];
        this.init();
    }

    async init() {
        // 获取当前会话
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
            this.currentUser = session.user;
            await this.loadUserProfile();
        }

        // 监听认证状态变化
        supabase.auth.onAuthStateChange((event, session) => {
            this.currentUser = session?.user || null;
            this.notifyListeners(event, session);
            
            if (session) {
                this.loadUserProfile();
            } else {
                this.userProfile = null;
            }
            
            this.updateUI();
        });

        this.updateUI();
    }

    // 添加认证状态监听器
    addAuthListener(callback) {
        this.authListeners.push(callback);
    }

    // 通知所有监听器
    notifyListeners(event, session) {
        this.authListeners.forEach(callback => callback(event, session));
    }

    // 用户注册
    async signUp(email, password, displayName) {
        try {
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        display_name: displayName
                    }
                }
            });

            if (error) throw error;

            return { success: true, data };
        } catch (error) {
            console.error('注册失败:', error);
            return { success: false, error: error.message };
        }
    }

    // 用户登录
    async signIn(email, password) {
        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password
            });

            if (error) throw error;

            return { success: true, data };
        } catch (error) {
            console.error('登录失败:', error);
            return { success: false, error: error.message };
        }
    }

    // 用户登出
    async signOut() {
        try {
            const { error } = await supabase.auth.signOut();
            if (error) throw error;
            
            this.currentUser = null;
            this.userProfile = null;
            return { success: true };
        } catch (error) {
            console.error('登出失败:', error);
            return { success: false, error: error.message };
        }
    }

    // 密码重置
    async resetPassword(email) {
        try {
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/reset-password.html`
            });

            if (error) throw error;

            return { success: true };
        } catch (error) {
            console.error('密码重置失败:', error);
            return { success: false, error: error.message };
        }
    }

    // 更新密码
    async updatePassword(newPassword) {
        try {
            const { error } = await supabase.auth.updateUser({
                password: newPassword
            });

            if (error) throw error;

            return { success: true };
        } catch (error) {
            console.error('密码更新失败:', error);
            return { success: false, error: error.message };
        }
    }

    // 加载用户配置
    async loadUserProfile() {
        if (!this.currentUser) return null;

        try {
            const { data, error } = await supabase
                .from('user_profiles')
                .select('*')
                .eq('id', this.currentUser.id)
                .maybeSingle(); // 使用 maybeSingle() 而不是 single()

            if (error) {
                console.warn('加载用户配置失败:', error);
                // 如果表不存在或没有权限，创建一个默认配置
                if (error.code === 'PGRST116' || error.code === '42P01' || error.message.includes('406')) {
                    console.log('用户配置表可能未创建，使用默认配置');
                    this.userProfile = {
                        id: this.currentUser.id,
                        display_name: this.currentUser.user_metadata?.display_name || this.currentUser.email?.split('@')[0] || '用户',
                        avatar_url: null,
                        phone: null,
                        address: null,
                        preferences: {}
                    };
                    return this.userProfile;
                }
                throw error;
            }

            // 如果没有找到用户配置，创建一个默认的
            if (!data) {
                console.log('未找到用户配置，创建默认配置');
                this.userProfile = {
                    id: this.currentUser.id,
                    display_name: this.currentUser.user_metadata?.display_name || this.currentUser.email?.split('@')[0] || '用户',
                    avatar_url: null,
                    phone: null,
                    address: null,
                    preferences: {}
                };
                
                // 尝试创建用户配置记录
                try {
                    await this.updateUserProfile(this.userProfile);
                } catch (createError) {
                    console.warn('无法创建用户配置记录:', createError);
                    // 即使创建失败，也使用默认配置
                }
                
                return this.userProfile;
            }

            this.userProfile = data;
            return data;
        } catch (error) {
            console.error('加载用户配置失败:', error);
            // 创建一个基本的用户配置作为备用
            this.userProfile = {
                id: this.currentUser.id,
                display_name: this.currentUser.user_metadata?.display_name || this.currentUser.email?.split('@')[0] || '用户',
                avatar_url: null,
                phone: null,
                address: null,
                preferences: {}
            };
            return this.userProfile;
        }
    }

    // 更新用户配置
    async updateUserProfile(profileData) {
        if (!this.currentUser) return { success: false, error: '用户未登录' };

        try {
            const { data, error } = await supabase
                .from('user_profiles')
                .upsert({
                    id: this.currentUser.id,
                    ...profileData,
                    updated_at: new Date().toISOString()
                })
                .select()
                .maybeSingle(); // 使用 maybeSingle() 而不是 single()

            if (error) {
                console.warn('更新用户配置失败:', error);
                // 如果表不存在或没有权限，只更新内存中的配置
                if (error.code === '42P01' || error.message.includes('406') || error.message.includes('relation') || error.message.includes('does not exist')) {
                    console.log('用户配置表不可用，仅更新内存配置');
                    this.userProfile = {
                        id: this.currentUser.id,
                        ...profileData
                    };
                    return { success: true, data: this.userProfile, warning: '配置仅保存在本地会话中' };
                }
                throw error;
            }

            this.userProfile = data;
            return { success: true, data };
        } catch (error) {
            console.error('更新用户配置失败:', error);
            // 作为备用方案，至少更新内存中的配置
            this.userProfile = {
                id: this.currentUser.id,
                ...profileData
            };
            return { success: false, error: error.message, fallback: this.userProfile };
        }
    }

    // 获取当前用户
    getCurrentUser() {
        return this.currentUser;
    }

    // 获取用户配置
    getUserProfile() {
        return this.userProfile;
    }

    // 检查是否已登录
    isAuthenticated() {
        return !!this.currentUser;
    }

    // 更新UI显示
    updateUI() {
        // 更新导航栏
        this.updateNavigation();
        
        // 更新页面内容
        this.updatePageContent();
    }

    // 更新导航栏
    updateNavigation() {
        const authButtons = document.getElementById('auth-buttons');
        const userMenu = document.getElementById('user-menu');
        const mobileAuthButtons = document.getElementById('mobile-auth-buttons');
        const mobileUserMenu = document.getElementById('mobile-user-menu');
        
        if (!authButtons && !userMenu && !mobileAuthButtons && !mobileUserMenu) return;

        if (this.isAuthenticated()) {
            const displayName = this.userProfile?.display_name || 
                               this.currentUser.user_metadata?.display_name || 
                               this.currentUser.email?.split('@')[0] || 
                               'User';

            // 桌面版 - 显示用户菜单
            if (authButtons) authButtons.style.display = 'none';
            if (userMenu) {
                userMenu.style.display = 'block';
                const userNameEl = userMenu.querySelector('.user-name');
                if (userNameEl) userNameEl.textContent = displayName;
            }

            // 移动版 - 显示用户菜单
            if (mobileAuthButtons) mobileAuthButtons.style.display = 'none';
            if (mobileUserMenu) {
                mobileUserMenu.style.display = 'block';
                const mobileUserNameEl = mobileUserMenu.querySelector('.mobile-user-name');
                if (mobileUserNameEl) mobileUserNameEl.textContent = displayName;
            }
            
            // 重新绑定用户菜单事件
            this.bindUserMenuEvents();
        } else {
            // 桌面版 - 显示登录/注册按钮
            if (authButtons) authButtons.style.display = 'flex';
            if (userMenu) userMenu.style.display = 'none';

            // 移动版 - 显示登录/注册按钮
            if (mobileAuthButtons) mobileAuthButtons.style.display = 'block';
            if (mobileUserMenu) mobileUserMenu.style.display = 'none';
        }
    }

    // 绑定用户菜单事件
    bindUserMenuEvents() {
        const userMenuButton = document.getElementById('user-menu-button');
        const userDropdown = document.getElementById('user-dropdown');
        const logoutButton = document.getElementById('logout-button');
        const mobileLogoutButton = document.getElementById('mobile-logout-button');

        if (userMenuButton && userDropdown) {
            // 移除现有事件监听器（如果有的话）
            userMenuButton.removeEventListener('click', this.handleUserMenuClick);
            
            // 绑定新的事件监听器
            this.handleUserMenuClick = (e) => {
                e.stopPropagation();
                const isVisible = userDropdown.style.display === 'block';
                userDropdown.style.display = isVisible ? 'none' : 'block';
            };
            userMenuButton.addEventListener('click', this.handleUserMenuClick);

            // 为所有下拉菜单中的链接添加点击事件，确保它们能正常跳转
            const dropdownLinks = userDropdown.querySelectorAll('a');
            dropdownLinks.forEach(link => {
                // 移除可能存在的旧监听器
                link.removeEventListener('click', this.handleProfileClick);
                
                // 添加新的点击处理器
                this.handleProfileClick = (e) => {
                    console.log('用户菜单链接被点击:', link.href);
                    
                    // 如果是个人中心链接，确保用户已登录
                    if (link.href.includes('profile.html')) {
                        if (!this.isAuthenticated()) {
                            e.preventDefault();
                            console.log('用户未登录，重定向到登录页面');
                            window.location.href = 'login.html';
                            return;
                        }
                        console.log('用户已登录，允许跳转到个人中心');
                    }
                    
                    // 关闭下拉菜单
                    userDropdown.style.display = 'none';
                    // 让链接正常跳转（不阻止默认行为）
                };
                
                link.addEventListener('click', this.handleProfileClick);
            });

            // 点击外部关闭下拉菜单
            if (!this.documentClickHandler) {
                this.documentClickHandler = (e) => {
                    const userMenuButton = document.getElementById('user-menu-button');
                    const userDropdown = document.getElementById('user-dropdown');
                    
                    if (userMenuButton && userDropdown && 
                        !userMenuButton.contains(e.target) && 
                        !userDropdown.contains(e.target)) {
                        userDropdown.style.display = 'none';
                    }
                };
                document.addEventListener('click', this.documentClickHandler);
            }
        }

        // 绑定退出登录事件
        [logoutButton, mobileLogoutButton].forEach(button => {
            if (button) {
                button.removeEventListener('click', this.handleLogoutClick);
                
                this.handleLogoutClick = async (e) => {
                    e.preventDefault();
                    console.log('用户点击退出登录');
                    const result = await this.signOut();
                    if (result.success) {
                        console.log('退出登录成功，刷新页面');
                        window.location.href = 'index.html';
                    }
                };
                button.addEventListener('click', this.handleLogoutClick);
            }
        });
    }

    // 更新页面内容
    updatePageContent() {
        // 移除自动重定向逻辑，让各个页面自己处理认证检查
        // 这样避免了在认证状态更新时的意外重定向
        
        // 注意：profile.html 页面有自己的认证检查逻辑
        // 如果需要页面保护，应该在各个页面的初始化脚本中处理
    }
}

// 用户收藏管理
export class FavoritesManager {
    constructor(authManager) {
        this.auth = authManager;
    }

    // 添加收藏
    async addFavorite(menuItemId) {
        if (!this.auth.isAuthenticated()) {
            return { success: false, error: '用户未登录' };
        }

        try {
            const { data, error } = await supabase
                .from('user_favorites')
                .insert({
                    user_id: this.auth.getCurrentUser().id,
                    menu_item_id: menuItemId
                })
                .select()
                .single();

            if (error) throw error;

            return { success: true, data };
        } catch (error) {
            console.error('添加收藏失败:', error);
            return { success: false, error: error.message };
        }
    }

    // 移除收藏
    async removeFavorite(menuItemId) {
        if (!this.auth.isAuthenticated()) {
            return { success: false, error: '用户未登录' };
        }

        try {
            const { error } = await supabase
                .from('user_favorites')
                .delete()
                .eq('user_id', this.auth.getCurrentUser().id)
                .eq('menu_item_id', menuItemId);

            if (error) throw error;

            return { success: true };
        } catch (error) {
            console.error('移除收藏失败:', error);
            return { success: false, error: error.message };
        }
    }

    // 获取用户收藏
    async getUserFavorites() {
        if (!this.auth.isAuthenticated()) {
            return { success: false, error: '用户未登录' };
        }

        try {
            const { data, error } = await supabase
                .from('user_favorites')
                .select(`
                    *,
                    menu_items (
                        id,
                        name,
                        name_en,
                        description,
                        price,
                        image_url,
                        categories (name, name_en)
                    )
                `)
                .eq('user_id', this.auth.getCurrentUser().id)
                .order('created_at', { ascending: false });

            if (error) throw error;

            return { success: true, data };
        } catch (error) {
            console.error('获取收藏失败:', error);
            return { success: false, error: error.message };
        }
    }

    // 检查是否已收藏
    async isFavorite(menuItemId) {
        if (!this.auth.isAuthenticated()) {
            return false;
        }

        try {
            const { data, error } = await supabase
                .from('user_favorites')
                .select('id')
                .eq('user_id', this.auth.getCurrentUser().id)
                .eq('menu_item_id', menuItemId)
                .single();

            return !error && data;
        } catch (error) {
            return false;
        }
    }

    // 加载用户收藏列表（简化方法名）
    async loadFavorites() {
        const result = await this.getUserFavorites();
        return result.success ? result.data : [];
    }
}

// 创建全局实例
export const authManager = new AuthManager();
export const favoritesManager = new FavoritesManager(authManager); 