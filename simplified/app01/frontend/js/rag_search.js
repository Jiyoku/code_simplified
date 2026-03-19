// 执行RAG搜索
async function performRAGSearch(query, options = {}) {
    const {
        showSummary = true,
        nResults = 10
    } = options;
    
    try {
        showSearchLoading();
        
        // 调用RAG API
        const data = await ragAPI.search(query, {
            nResults,
            generateSummary: showSummary
        });
        
        hideSearchLoading();
        
        // 显示AI摘要
        if (data.summary && showSummary) {
            renderAISummary(data.summary);
        }
        
        // 分类并渲染结果
        const posts = data.results.filter(r => r.metadata && r.metadata.type === 'post');
        const books = data.results.filter(r => r.metadata && r.metadata.type === 'book');
        
        // 更新计数
        updateResultCounts(posts.length, books.length);
        
        // 渲染结果
        renderRAGPosts(posts);
        renderRAGBooks(books);
        
        // 显示性能指标
        showPerformanceStats(data);
        
    } catch (error) {
        hideSearchLoading();
        console.error('RAG搜索失败:', error);
        showMessage('智能搜索失败，已切换到传统搜索', 'warning');
        
        // 降级到传统搜索
        await performTraditionalSearch(query);
    }
}

// 渲染AI摘要
function renderAISummary(summary) {
    // 移除旧的摘要
    const oldSummary = document.getElementById('aiSummary');
    if (oldSummary) {
        oldSummary.remove();
    }
    
    // 创建新的摘要容器
    const summaryCard = document.createElement('div');
    summaryCard.id = 'aiSummary';
    summaryCard.className = 'glass-card p-4 mb-4 ai-summary-card';
    summaryCard.style.animation = 'fadeInUp 0.5s ease-out';
    
    summaryCard.innerHTML = `
        <div class="d-flex justify-content-between align-items-start mb-3">
            <h5 class="mb-0">
                <i class="fas fa-robot me-2 text-primary"></i>
                <span class="ai-badge">AI智能摘要</span>
            </h5>
            <button class="btn btn-sm btn-outline-secondary" onclick="this.parentElement.parentElement.remove()">
                <i class="fas fa-times"></i>
            </button>
        </div>
        <div class="ai-summary-content">
            ${formatSummary(summary)}
        </div>
        <div class="ai-footer mt-3">
            <small class="text-muted">
                <i class="fas fa-info-circle me-1"></i>
                此摘要由AI基于平台内容生成
            </small>
        </div>
    `;
    
    // 插入到结果前
    const tabContent = document.querySelector('.tab-content');
    if (tabContent && tabContent.parentNode) {
        tabContent.parentNode.insertBefore(summaryCard, tabContent);
    }
}

// 格式化摘要（支持Markdown）
function formatSummary(summary) {
    return summary
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')  // 粗体
        .replace(/【(.*?)】/g, '<h6 class="mt-3 mb-2">$1</h6>')  // 标题
        .replace(/- (.*?)(\n|$)/g, '<li>$1</li>')  // 列表项
        .replace(/\n/g, '<br>')  // 换行
        .replace(/(<li>.*<\/li>)/g, '<ul class="mb-2">$1</ul>');  // 包装列表
}

// 渲染RAG搜索的帖子结果
function renderRAGPosts(posts) {
    const container = document.getElementById('postsContainer');
    
    if (!posts || posts.length === 0) {
        container.innerHTML = `
            <div class="glass-card p-5 text-center">
                <i class="fas fa-search fa-3x text-muted mb-3"></i>
                <h5 class="text-muted">未找到相关帖子</h5>
            </div>
        `;
        return;
    }
    
    container.innerHTML = `
        <div class="row">
            ${posts.map(item => {
                const metadata = item.metadata || {};
                const score = (item.score * 100).toFixed(0);
                
                return `
                    <div class="col-md-6 mb-4">
                        <div class="glass-card h-100 rag-result-card">
                            <div class="card-body p-3">
                                <div class="d-flex justify-content-between align-items-start mb-2">
                                    <h5 class="card-title mb-0">
                                        <a href="post-detail.html?id=${metadata.content_id}" 
                                           class="text-decoration-none text-dark">
                                            ${highlightText(metadata.title || '未知标题', searchQuery)}
                                        </a>
                                    </h5>
                                    <span class="badge bg-success">${score}%</span>
                                </div>
                                
                                <p class="card-text text-muted small mb-3">
                                    ${highlightText(truncate(item.document || '', 150), searchQuery)}
                                </p>
                                
                                <div class="d-flex justify-content-between align-items-center">
                                    <small class="text-muted">
                                        <i class="fas fa-user me-1"></i>${metadata.author || '匿名'}
                                    </small>
                                    <div>
                                        <small class="text-muted me-2">
                                            <i class="fas fa-eye me-1"></i>${metadata.views || 0}
                                        </small>
                                        <small class="text-muted">
                                            <i class="fas fa-heart me-1"></i>${metadata.likes || 0}
                                        </small>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
            }).join('')}
        </div>
    `;
}

// 渲染RAG搜索的书籍结果
function renderRAGBooks(books) {
    const container = document.getElementById('booksContainer');
    
    if (!books || books.length === 0) {
        container.innerHTML = `
            <div class="glass-card p-5 text-center">
                <i class="fas fa-search fa-3x text-muted mb-3"></i>
                <h5 class="text-muted">未找到相关书籍</h5>
            </div>
        `;
        return;
    }
    
    container.innerHTML = `
        <div class="row">
            ${books.map(item => {
                const metadata = item.metadata || {};
                const score = (item.score * 100).toFixed(0);
                
                return `
                    <div class="col-lg-4 col-md-6 mb-4">
                        <div class="glass-card h-100 rag-result-card">
                            <div class="card-body p-3">
                                <div class="d-flex justify-content-between align-items-start mb-2">
                                    <h5 class="card-title mb-0">
                                        <a href="book-detail.html?id=${metadata.content_id}" 
                                           class="text-decoration-none text-dark">
                                            ${highlightText(metadata.title || '未知书名', searchQuery)}
                                        </a>
                                    </h5>
                                    <span class="badge bg-success">${score}%</span>
                                </div>
                                
                                <p class="text-muted small mb-2">
                                    作者：${highlightText(metadata.author || '未知', searchQuery)}
                                </p>
                                
                                <p class="card-text text-muted small mb-3">
                                    ${highlightText(truncate(item.document || '', 100), searchQuery)}
                                </p>
                                
                                <div class="text-end">
                                    <small class="text-muted">
                                        <i class="fas fa-heart me-1"></i>
                                        ${metadata.recommendation_count || 0} 推荐
                                    </small>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
            }).join('')}
        </div>
    `;
}

// 高亮搜索关键词
function highlightText(text, keyword) {
    if (!text || !keyword) return text;
    const regex = new RegExp(`(${escapeRegex(keyword)})`, 'gi');
    return text.replace(regex, '<mark class="rag-highlight">$1</mark>');
}

// 显示性能统计
function showPerformanceStats(data) {
    if (!data.search_time) return;
    
    console.log('=== RAG搜索性能 ===');
    console.log(`搜索耗时: ${data.search_time}秒`);
    console.log(`生成耗时: ${data.generation_time}秒`);
    console.log(`总耗时: ${data.total_time}秒`);
}

// 更新结果计数
function updateResultCounts(postCount, bookCount) {
    const postCountEl = document.getElementById('postCount');
    const bookCountEl = document.getElementById('bookCount');
    
    if (postCountEl) postCountEl.textContent = postCount;
    if (bookCountEl) bookCountEl.textContent = bookCount;
}

// 显示/隐藏加载状态
function showSearchLoading() {
    const loadingHtml = `
        <div class="text-center py-5" id="ragLoadingIndicator">
            <div class="spinner-border text-primary mb-3" style="width: 3rem; height: 3rem;"></div>
            <h5 class="text-muted">
                <i class="fas fa-robot me-2"></i>AI正在搜索和分析...
            </h5>
            <p class="text-muted small">正在检索相关内容并生成智能摘要</p>
        </div>
    `;
    
    const containers = ['postsContainer', 'booksContainer'];
    containers.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.innerHTML = loadingHtml;
    });
}

function hideSearchLoading() {
    const indicators = document.querySelectorAll('#ragLoadingIndicator');
    indicators.forEach(el => el.remove());
}

// 添加样式
const ragStyles = document.createElement('style');
ragStyles.textContent = `
    .ai-summary-card {
        border-left: 4px solid #6a67ce;
        background: linear-gradient(135deg, rgba(106, 103, 206, 0.05) 0%, rgba(62, 158, 158, 0.05) 100%);
    }
    
    .ai-badge {
        background: linear-gradient(45deg, #6a67ce, #3e9e9e);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
        font-weight: 600;
    }
    
    .rag-highlight {
        background-color: #fff3cd;
        padding: 0.1rem 0.3rem;
        border-radius: 3px;
        font-weight: 600;
    }
    
    .rag-result-card {
        transition: all 0.3s ease;
        border: 1px solid rgba(106, 103, 206, 0.2);
    }
    
    .rag-result-card:hover {
        transform: translateY(-3px);
        box-shadow: 0 8px 25px rgba(106, 103, 206, 0.2);
        border-color: #6a67ce;
    }
`;
document.head.appendChild(ragStyles);