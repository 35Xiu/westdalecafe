# Westdale Cafe 用户认证系统使用指南

## 概述

本项目已成功集成了完整的用户认证系统，基于 Supabase Auth 构建，提供安全的用户登录、注册和数据隔离功能。

## 功能特性

### 🔐 用户认证
- 用户注册（邮箱验证）
- 用户登录/登出
- 密码重置
- 会话管理

### 👤 用户管理
- 个人资料管理
- 偏好设置
- 密码更新
- 账户信息统计

### 🔒 数据安全
- 行级安全策略（RLS）
- 用户数据完全隔离
- 自动数据清理（级联删除）

### 📊 用户功能
- 收藏功能（添加、移除、查看）
- 用户评价系统

## 文件结构

### 数据库设置
- `user-auth-setup.sql` - 完整的数据库设置脚本

### 前端文件
- `login.html` - 登录/注册页面
- `profile.html` - 用户个人资料页面
- `js/auth.js` - 认证系统 JavaScript 模块

### 更新的文件
- `index.html` - 添加了用户菜单和认证状态显示

## 数据库表结构

### 用户配置表 (user_profiles)
```sql
- id (UUID) - 关联到 auth.users
- display_name (VARCHAR) - 显示名称
- avatar_url (TEXT) - 头像URL
- phone (VARCHAR) - 电话号码
- address (TEXT) - 地址
- preferences (JSONB) - 用户偏好设置
- created_at/updated_at - 时间戳
```



### 用户收藏表 (user_favorites)
```sql
- id (UUID) - 主键
- user_id (UUID) - 用户ID
- menu_item_id (INTEGER) - 菜单项目ID
- created_at - 创建时间
```

### 用户评价表 (user_reviews)
```sql
- id (UUID) - 主键
- user_id (UUID) - 用户ID
- menu_item_id (INTEGER) - 菜单项目ID
- rating (INTEGER) - 评分 (1-5)
- comment (TEXT) - 评价内容
- created_at/updated_at - 时间戳
```

## 安装步骤

### 1. 数据库设置
在 Supabase 控制台中执行 `user-auth-setup.sql` 脚本：

```sql
-- 运行 user-auth-setup.sql 中的所有SQL语句
-- 这将创建所有必要的表、政策、函数和触发器
```

### 2. 配置邮件服务
在 Supabase 控制台的 Authentication > Settings 中配置：
- Email templates（邮件模板）
- SMTP settings（SMTP设置）
- Redirect URLs（重定向URL）

### 3. 启用认证功能
在 Supabase 控制台的 Authentication > Settings 中启用：
- Email confirmations
- Password recovery
- 根据需要配置其他选项

## 使用方法

### 用户注册流程
1. 访问 `login.html` 页面
2. 点击"注册"标签
3. 填写用户信息（显示名称、邮箱、密码）
4. 系统发送确认邮件
5. 用户点击邮件中的确认链接
6. 注册完成，自动创建用户配置

### 用户登录流程
1. 访问 `login.html` 页面
2. 输入邮箱和密码
3. 点击登录
4. 成功后重定向到首页
5. 导航栏显示用户菜单

### 个人资料管理
1. 登录后点击用户菜单中的"个人资料"
2. 在"基本信息"标签页编辑个人信息
3. 在"偏好设置"标签页设置咖啡偏好和通知选项
4. 在"安全设置"标签页修改密码

### 数据隔离机制
系统使用 Supabase 的行级安全策略（RLS）确保：
- 用户只能查看和修改自己的数据
- 自动过滤查询结果，防止数据泄露
- 所有用户相关表都受到保护

## API 使用示例

### 认证管理
```javascript
import { authManager } from './js/auth.js';

// 用户注册
const result = await authManager.signUp(email, password, displayName);

// 用户登录
const result = await authManager.signIn(email, password);

// 用户登出
const result = await authManager.signOut();

// 检查登录状态
const isLoggedIn = authManager.isAuthenticated();

// 获取当前用户
const user = authManager.getCurrentUser();

// 更新用户配置
const result = await authManager.updateUserProfile(profileData);
```

### 收藏管理
```javascript
import { favoritesManager } from './js/auth.js';

// 添加收藏
const result = await favoritesManager.addFavorite(menuItemId);

// 移除收藏
const result = await favoritesManager.removeFavorite(menuItemId);

// 获取用户收藏
const result = await favoritesManager.getUserFavorites();

// 检查是否已收藏
const isFavorited = await favoritesManager.isFavorite(menuItemId);
```

## 安全考虑

### 数据保护
- 所有用户数据都通过 RLS 政策保护
- 密码使用 Supabase 标准加密
- 会话管理由 Supabase Auth 处理

### 输入验证
- 前端和后端都进行数据验证
- SQL 注入防护（使用参数化查询）
- XSS 防护（输入转义）

### 访问控制
- 受保护页面自动重定向未登录用户
- API 调用需要有效的认证令牌
- 敏感操作需要重新验证

## 错误处理

系统提供完善的错误处理机制：
- 网络错误处理
- 认证失败处理
- 数据验证错误处理
- 用户友好的错误消息

## 扩展功能

### 可添加的功能
1. 社交登录（Google、Facebook等）
2. 双因素认证（2FA）
3. 用户角色和权限管理
4. 用户活动日志
5. 数据导出功能

### 自定义选项
1. 邮件模板定制
2. 用户界面主题
3. 业务逻辑扩展
4. 第三方集成

## 故障排除

### 常见问题
1. **邮件未收到** - 检查 SMTP 配置和垃圾邮件文件夹
2. **登录失败** - 验证邮箱确认状态
3. **数据加载失败** - 检查 RLS 政策配置
4. **权限错误** - 确认用户认证状态

### 调试工具
- 浏览器开发者工具
- Supabase 控制台日志
- 网络请求监控

## 联系支持

如果遇到技术问题，请：
1. 检查控制台错误信息
2. 查看 Supabase 项目日志
3. 参考 Supabase 官方文档
4. 联系开发团队

---

*此文档将根据系统更新和用户反馈持续改进。* 