// ==================== 帖子相关 API ====================
const postAPI = {
    // 获取首页数据
    async getIndexData() {
        return api.get(API_ENDPOINTS.INDEX, {}, false);
    },

    // 获取帖子列表
    async getPosts(params = {}) {
        return api.get(API_ENDPOINTS.POSTS, params);
    },

    // 获取帖子详情
    async getPost(id) {
        return api.get(API_ENDPOINTS.POST_DETAIL(id));
    },

    // 创建帖子
    async createPost(data) {
        return api.post(API_ENDPOINTS.POSTS, data);
    },

    // 更新帖子
    async updatePost(id, data) {
        return api.put(API_ENDPOINTS.POST_DETAIL(id), data);
    },

    // 删除帖子
    async deletePost(id) {
        return api.delete(API_ENDPOINTS.POST_DETAIL(id));
    },

    // 点赞帖子
    async likePost(id) {
        return api.post(API_ENDPOINTS.POST_LIKE(id));
    },

    // 获取我的帖子
    async getMyPosts() {
        return api.get(API_ENDPOINTS.MY_POSTS);
    },

};

// ==================== 书籍相关 API ====================
const bookAPI = {
    // 获取书籍列表
    async getBooks(params = {}) {
        return api.get(API_ENDPOINTS.BOOKS, params);
    },

    // 获取书籍详情
    async getBook(id) {
        return api.get(API_ENDPOINTS.BOOK_DETAIL(id));
    },

    // 创建书籍
    async createBook(data) {
        return api.post(API_ENDPOINTS.BOOKS, data);
    },

    // 获取我的书籍
    async getMyBooks() {
        return api.get(API_ENDPOINTS.MY_BOOKS);
    }
};

// ==================== 标签相关 API ====================
const tagAPI = {
    // 获取标签列表
    async getTags() {
        return api.get(API_ENDPOINTS.TAGS);
    },

    // 获取标签详情
    async getTag(id) {
        return api.get(API_ENDPOINTS.TAG_DETAIL(id));
    }
};


// ==================== RAG搜索API ==================== ⭐

const ragAPI = {
    /**
     * RAG智能搜索
     */
    async search(query, options = {}) {
        const {
            nResults = 5,
            contentType = null,
            generateSummary = true
        } = options;
        
        return api.post(API_ENDPOINTS.RAG_SEARCH, {
            query,
            n_results: nResults,
            content_type: contentType,
            generate_summary: generateSummary
        }, false);  // 不需要认证
    },
    
    /**
     * 流式RAG搜索
     */
    streamSearch(query, onMessage, options = {}) {
        const {
            nResults = 5,
            contentType = null
        } = options;
        
        return fetch(`${API_CONFIG.BASE_URL}${API_ENDPOINTS.RAG_STREAM_SEARCH}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                query,
                n_results: nResults,
                content_type: contentType
            })
        }).then(response => {
            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            
            function readChunk() {
                return reader.read().then(({ done, value }) => {
                    if (done) {
                        return;
                    }
                    
                    const chunk = decoder.decode(value);
                    const lines = chunk.split('\n');
                    
                    for (const line of lines) {
                        if (line.startsWith('data: ')) {
                            const data = JSON.parse(line.slice(6));
                            onMessage(data);
                        }
                    }
                    
                    return readChunk();
                });
            }
            
            return readChunk();
        });
    },
    
    /**
     * 语义搜索（无LLM）
     */
    async semanticSearch(query, options = {}) {
        const {
            nResults = 10,
            minScore = 0.5
        } = options;
        
        return api.post(API_ENDPOINTS.SEMANTIC_SEARCH, {
            query,
            n_results: nResults,
            min_score: minScore
        }, false);
    },
    
    /**
     * 获取RAG统计信息
     */
    async getStats() {
        return api.get(API_ENDPOINTS.RAG_STATS, {}, false);
    }
};

// 扩展searchAPI，支持RAG
const searchAPI = {
    /**
     * 传统搜索
     */
    async traditionalSearch(query) {
        return api.get(API_ENDPOINTS.SEARCH, { q: query, use_rag: 'false' }, false);
    },
    
    /**
     * RAG增强搜索
     */
    async ragSearch(query) {
        return api.get(API_ENDPOINTS.SEARCH, { q: query, use_rag: 'true' }, false);
    },
    
    /**
     * 自动选择搜索方式
     */
    async search(query, useRAG = true) {
        if (useRAG) {
            try {
                return await this.ragSearch(query);
            } catch (e) {
                console.warn('RAG搜索失败，降级到传统搜索', e);
                return await this.traditionalSearch(query);
            }
        } else {
            return await this.traditionalSearch(query);
        }
    }
};