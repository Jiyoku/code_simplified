// 书籍首页逻辑

// 页面加载完成后执行
document.addEventListener('DOMContentLoaded', () => {
    // 如果用户已登录，显示添加书籍按钮
    if (auth.isAuthenticated()) {
        const addBookBtn = document.getElementById('addBookBtn');
        if (addBookBtn) {
            addBookBtn.style.display = 'inline-block';
        }
    }

    // 加载数据
    loadPopularBooks();
    loadLatestBooks();
});

// 加载热门书籍
async function loadPopularBooks() {
    try {
        const data = await bookAPI.getBooks({ order: 'popular' });
        const books = data.results || data;
        renderBooks(books.slice(0, 6), 'popularBooksContainer');
    } catch (error) {
        console.error('加载热门书籍失败:', error);
        renderEmptyState('popularBooksContainer', '暂无热门书籍');
    }
}

// 加载最新书籍
async function loadLatestBooks() {
    try {
        const data = await bookAPI.getBooks({ order: '-created_at' });
        const books = data.results || data;
        renderBooks(books.slice(0, 6), 'latestBooksContainer');
    } catch (error) {
        console.error('加载最新书籍失败:', error);
        renderEmptyState('latestBooksContainer', '暂无书籍');
    }
}

// 渲染书籍列表
function renderBooks(books, containerId) {
    const container = document.getElementById(containerId);
    
    if (!books || books.length === 0) {
        renderEmptyState(containerId, '暂无书籍');
        return;
    }
    
    container.innerHTML = books.map(book => `
        <div class="col-lg-4 col-md-6 col-sm-12 mb-4">
            <div class="book-card glass-card h-100">
                <div class="card-body p-3">
                    ${book.cover_image ? 
                        `<img src="${book.cover_image}" alt="${book.title}" class="book-cover mb-3">` :
                        `<div class="book-placeholder mb-3">
                            <i class="fas fa-book fa-2x"></i>
                        </div>`
                    }
                    
                    <h5 class="card-title mb-2">
                        <a href="book-detail.html?id=${book.id}" class="text-decoration-none text-dark">
                            ${truncate(book.title, 30)}
                        </a>
                    </h5>
                    <p class="text-muted small mb-2">作者：${book.author}</p>
                    ${book.description ? `
                        <p class="card-text text-muted small mb-3">
                            ${truncate(book.description, 80)}
                        </p>
                    ` : ''}
                    
                    <div class="d-flex justify-content-between align-items-center">
                        ${containerId === 'popularBooksContainer' ? `
                            <small class="text-muted">
                                <i class="fas fa-heart me-1"></i>${book.recommendation_count || 0} 推荐
                            </small>
                            <small class="text-muted">
                                <i class="fas fa-store me-1"></i>在售
                            </small>
                        ` : `
                            <small class="text-muted">
                                <i class="fas fa-user me-1"></i>${book.created_by_username || '匿名'}
                            </small>
                            <small class="text-muted">
                                <i class="fas fa-calendar me-1"></i>${formatDate(book.created_at).split(' ')[0]}
                            </small>
                        `}
                    </div>
                </div>
            </div>
        </div>
    `).join('');
}

// 渲染空状态
function renderEmptyState(containerId, message) {
    const container = document.getElementById(containerId);
    container.innerHTML = `
        <div class="col-12">
            <p class="text-center text-muted">${message}</p>
        </div>
    `;
}