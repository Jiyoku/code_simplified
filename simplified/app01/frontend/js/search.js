// 搜索结果页面逻辑

let searchQuery = '';

// 页面加载完成后执行
document.addEventListener('DOMContentLoaded', () => {
    // 获取搜索关键词
    searchQuery = getUrlParam('q');
    
    if (searchQuery) {
        // 显示搜索关键词
        document.getElementById('searchKeyword').style.display = 'block';
        document.getElementById('keywordText').textContent = searchQuery;
        
        // 设置搜索框的值
        document.getElementById('searchInput').value = searchQuery;
        
        // 执行搜索
        performSearch(searchQuery);
    } else {
        // 显示空状态
        showEmptyState();
    }
});

// 执行搜索
async function performSearch(query) {
    searchQuery = query;  // 保存查询用于高亮
    
    const useRAG = document.getElementById('ragToggle')?.checked || false;
    
    if (useRAG) {
        // 使用RAG智能搜索
        await performRAGSearch(query, {
            showSummary: true,
            nResults: 10
        });
    } else {
        // 使用传统搜索
        await performTraditionalSearch(query);
    }
}

// 传统搜索（原有逻辑）
async function performTraditionalSearch(query) {
    try {
        const data = await searchAPI.traditionalSearch(query);
        
        // 渲染结果
        renderPosts(data.posts);
        renderBooks(data.books);
        
        // 更新计数
        updateResultCounts(data.posts.length, data.books.length);
    } catch (error) {
        console.error('搜索失败:', error);
        showMessage('搜索失败', 'danger');
    }
}

// 显示RAG说明
function showRAGInfo() {
    showMessage(`
        <h6>什么是AI智能搜索？</h6>
        <p>AI智能搜索使用先进的人工智能技术，能够：</p>
        <ul>
            <li>理解您的搜索意图，而不仅仅是匹配关键词</li>
            <li>找到语义相关的内容，即使用词不同</li>
            <li>自动生成智能摘要和推荐</li>
            <li>提供个性化的学习建议</li>
        </ul>
        <p class="mb-0">开启后将获得更智能、更准确的搜索体验！</p>
    `, 'info', 8000);
}

// 渲染帖子搜索结果
function renderPosts(posts) {
    const container = document.getElementById('postsContainer');
    
    if (!posts || posts.length === 0) {
        container.innerHTML = `
            <div class="glass-card p-5 text-center">
                <i class="fas fa-search fa-3x text-muted mb-3"></i>
                <h4 class="text-muted">未找到相关帖子</h4>
                <p class="text-muted">试试其他关键词吧</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = `
        <div class="row">
            ${posts.map(post => `
                <div class="col-md-6 mb-4">
                    <div class="glass-card h-100 search-result-item">
                        <div class="card-body p-3">
                            <h5 class="card-title mb-2">
                                <a href="post-detail.html?id=${post.id}" class="text-decoration-none text-dark">
                                    ${highlightKeyword(post.title, searchQuery)}
                                </a>
                            </h5>
                            <p class="card-text text-muted small mb-3">
                                ${highlightKeyword(truncate(post.content, 120), searchQuery)}
                            </p>
                            
                            <!-- 标签 -->
                            ${(post.tags && post.tags.length > 0) ? `
                                <div class="mb-2">
                                    ${post.tags.slice(0, 3).map(tag => 
                                        `<span class="badge bg-light text-dark me-1">${tag.name}</span>`
                                    ).join('')}
                                </div>
                            ` : ''}
                            
                            <!-- 帖子信息 -->
                            <div class="d-flex justify-content-between align-items-center">
                                <small class="text-muted">
                                    <i class="fas fa-user me-1"></i>${post.author_username || '匿名'}
                                </small>
                                <div class="post-stats">
                                    <small class="text-muted me-2">
                                        <i class="fas fa-eye me-1"></i>${post.views || 0}
                                    </small>
                                    <small class="text-muted">
                                        <i class="fas fa-heart me-1"></i>${post.likes || 0}
                                    </small>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
}

// 渲染书籍搜索结果
function renderBooks(books) {
    const container = document.getElementById('booksContainer');
    
    if (!books || books.length === 0) {
        container.innerHTML = `
            <div class="glass-card p-5 text-center">
                <i class="fas fa-search fa-3x text-muted mb-3"></i>
                <h4 class="text-muted">未找到相关书籍</h4>
                <p class="text-muted">试试其他关键词吧</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = `
        <div class="row">
            ${books.map(book => `
                <div class="col-lg-4 col-md-6 mb-4">
                    <div class="glass-card h-100 search-result-item">
                        <div class="card-body p-3">
                            ${book.cover_image ? 
                                `<img src="${book.cover_image}" alt="${book.title}" class="book-cover mb-2">` :
                                `<div class="book-placeholder mb-2">
                                    <i class="fas fa-book fa-2x"></i>
                                </div>`
                            }
                            
                            <h5 class="card-title mb-2">
                                <a href="book-detail.html?id=${book.id}" class="text-decoration-none text-dark">
                                    ${highlightKeyword(truncate(book.title, 30), searchQuery)}
                                </a>
                            </h5>
                            <p class="text-muted small mb-2">
                                作者：${highlightKeyword(book.author, searchQuery)}
                            </p>
                            ${book.description ? `
                                <p class="card-text text-muted small mb-3">
                                    ${highlightKeyword(truncate(book.description, 80), searchQuery)}
                                </p>
                            ` : ''}
                            
                            <div class="d-flex justify-content-between align-items-center">
                                <small class="text-muted">
                                    <i class="fas fa-user me-1"></i>${book.created_by_username || '匿名'}
                                </small>
                                <small class="text-muted">
                                    <i class="fas fa-heart me-1"></i>${book.recommendation_count || 0}
                                </small>
                            </div>
                        </div>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
}

// 高亮关键词
function highlightKeyword(text, keyword) {
    if (!text || !keyword) return text;
    
    const regex = new RegExp(`(${escapeRegex(keyword)})`, 'gi');
    return text.replace(regex, '<mark class="highlight">$1</mark>');
}

// 转义正则表达式特殊字符
function escapeRegex(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// 显示空状态
function showEmptyState() {
    const postsContainer = document.getElementById('postsContainer');
    const booksContainer = document.getElementById('booksContainer');
    
    const emptyHTML = `
        <div class="glass-card p-5 text-center">
            <i class="fas fa-search fa-3x text-muted mb-3"></i>
            <h4 class="text-muted">请输入搜索关键词</h4>
            <p class="text-muted">在上方搜索框中输入您要查找的内容</p>
        </div>
    `;
    
    postsContainer.innerHTML = emptyHTML;
    booksContainer.innerHTML = emptyHTML;
    
    // 隐藏关键词显示
    document.getElementById('searchKeyword').style.display = 'none';
    
    // 更新计数
    document.getElementById('postCount').textContent = '0';
    document.getElementById('bookCount').textContent = '0';
}

// 处理搜索表单提交
function handleSearch(event) {
    event.preventDefault();
    
    const searchInput = document.getElementById('searchInput');
    const query = searchInput.value.trim();
    
    if (!query) {
        showMessage('请输入搜索关键词', 'warning');
        return;
    }
    
    // 跳转到搜索结果页（带参数）
    window.location.href = `search.html?q=${encodeURIComponent(query)}`;
}