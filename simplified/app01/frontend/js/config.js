// API 配置文件
const API_CONFIG = {
    // 开发环境
    BASE_URL: '/api',  // Nginx会代理到后端 
    TIMEOUT: 30000
};

// API端点
const API_ENDPOINTS = {
    // 认证
    LOGIN: '/auth/login/',
    REGISTER: '/auth/register/',
    LOGOUT: '/auth/logout/',
    CHANGE_PASSWORD: '/auth/change-password/',
    ACCOUNT: '/account/',
    
    // 首页数据
    INDEX: '/index/',

     // 帖子
    POSTS: '/posts/',
    POST_DETAIL: (id) => `/posts/${id}/`,
    POST_CREATE: '/posts/create/',
    POST_UPDATE: (id) => `/posts/${id}/update/`,
    POST_DELETE: (id) => `/posts/${id}/delete/`,
    POST_LIKE: (id) => `/posts/${id}/like/`,
    MY_POSTS: '/posts/my-posts/',

    // 标签
    TAGS: '/tags/',
    TAG_DETAIL: (id) => `/tags/${id}/`,
    
    // 书籍
    BOOKS: '/books/',
    BOOK_DETAIL: (id) => `/books/${id}/`,
    MY_BOOKS: '/books/my_books/',
    
    // 书籍出售
    BOOK_SALES: '/book-sales/',
    BOOK_SALE_DETAIL: (id) => `/book-sales/${id}/`,
    MY_SALES: '/book-sales/my_sales/',
    
    // 搜索
    SEARCH: '/search/',

    // RAG智能搜索
    RAG_SEARCH: '/rag/search/',
    RAG_STREAM_SEARCH: '/rag/stream-search/',
    SEMANTIC_SEARCH: '/rag/semantic-search/',
    RAG_STATS: '/rag/stats/',
};