// js/auth.js - 修复版

// ==================== 配置检查 ====================
if (typeof API_CONFIG === 'undefined') {
    console.error('错误: API_CONFIG 未定义，请确保 config.js 已加载');
}

// ==================== Auth 类 ====================
class Auth {
    constructor() {
        this.user = this.getUser();
    }

    getUser() {
        const userStr = localStorage.getItem('user');
        return userStr ? JSON.parse(userStr) : null;
    }

    saveUser(user, token) {
        localStorage.setItem('user', JSON.stringify(user));
        localStorage.setItem('token', token);
        this.user = user;
    }

    clearUser() {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        this.user = null;
    }

    isAuthenticated() {
        return !!localStorage.getItem('token');
    }

    getUsername() {
        return this.user ? this.user.username : null;
    }

    async login(username, password) {
        // 延迟获取 authAPI，避免初始化时依赖问题
        const data = await authAPI.login(username, password);
        const token = data.token || data.access;
        if (!token) {
            throw new Error('登录接口未返回 token');
        }
        const user = data.user || { username };
        this.saveUser(user, token);
        return data;
    }

    async logout() {
        try {
            await authAPI.logout();
        } catch (error) {
            console.error('登出失败:', error);
        } finally {
            this.clearUser();
            window.location.href = 'index.html';
        }
    }

    async register(userData) {
        const data = await authAPI.register(userData);
        this.saveUser(data.user, data.token);
        return data;
    }

    requireAuth() {
        if (!this.isAuthenticated()) {
            showMessage('请先登录', 'warning');
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 1500);
            return false;
        }
        return true;
    }
}

// ==================== 先创建 auth 实例 ====================
const auth = new Auth();

// ==================== API 类 ====================
class API {
    constructor() {
        this.baseURL = API_CONFIG.BASE_URL;
        this.timeout = API_CONFIG.TIMEOUT;
    }

    getToken() {
        return localStorage.getItem('token');
    }

    getHeaders(includeAuth = true) {
        const headers = {
            'Content-Type': 'application/json'
        };
        if (includeAuth) {
            const token = this.getToken();
            if (token) {
                headers['Authorization'] = `Token ${token}`;
            }
        }
        return headers;
    }

    async request(url, options = {}) {
        const config = {
            method: options.method || 'GET',
            headers: this.getHeaders(options.auth !== false),
            ...options
        };

        if (config.body && !(config.body instanceof FormData)) {
            config.body = JSON.stringify(config.body);
        }

        try {
            const response = await fetch(this.baseURL + url, config);
            if (!response.ok) {
                const error = await response.json().catch(() => ({}));
                console.error('后端返回错误详情:', JSON.stringify(error));
                throw new Error(error.error || error.detail || `请求失败: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error('API请求错误:', error);
            throw error;
        }
    }

    async get(url, params = {}, auth = true) {
        const queryString = new URLSearchParams(params).toString();
        const fullUrl = queryString ? `${url}?${queryString}` : url;
        return this.request(fullUrl, { method: 'GET', auth });
    }

    async post(url, data = {}, auth = true) {
        return this.request(url, {
            method: 'POST',
            body: data,
            auth
        });
    }

    async put(url, data = {}) {
        return this.request(url, {
            method: 'PUT',
            body: data
        });
    }

    async delete(url) {
        return this.request(url, {
            method: 'DELETE'
        });
    }
}

const api = new API();

// ==================== authAPI 定义在最后 ====================
const authAPI = {
    async login(username, password) {
        return api.post(API_ENDPOINTS.LOGIN, { username, password }, false);
    },

    async register(data) {
        return api.post(API_ENDPOINTS.REGISTER, data, false);
    },

    async logout() {
        return api.post(API_ENDPOINTS.LOGOUT);
    },

    async changePassword(data) {
        return api.put(API_ENDPOINTS.CHANGE_PASSWORD, data);
    },

    async getAccount() {
        return api.get(API_ENDPOINTS.ACCOUNT);
    },

    async updateAccount(data) {
        return api.put(API_ENDPOINTS.ACCOUNT, data);
    }
};