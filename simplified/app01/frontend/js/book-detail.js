// 书籍详情页面逻辑

let currentBook = null;
let bookId = null;

// 页面加载完成后执行
document.addEventListener('DOMContentLoaded', () => {
    // 获取书籍ID
    bookId = getUrlParam('id');
    if (!bookId) {
        showMessage('书籍不存在', 'danger');
        setTimeout(() => {
            window.location.href = 'books.html';
        }, 1500);
        return;
    }

    // 如果用户已登录，显示相关按钮
    if (auth.isAuthenticated()) {
        const addSaleBtn = document.getElementById('addSaleBtn');
        const createBookBtn = document.getElementById('createBookBtn');
        const myBooksBtn = document.getElementById('myBooksBtn');
        
        if (addSaleBtn) addSaleBtn.style.display = 'inline-block';
        if (createBookBtn) createBookBtn.style.display = 'block';
        if (myBooksBtn) myBooksBtn.style.display = 'block';
    }

    // 加载书籍详情
    loadBookDetail();
});

// 加载书籍详情
async function loadBookDetail() {
    try {
        const book = await bookAPI.getBook(bookId);
        currentBook = book;
        
        renderBookInfo(book);
        loadSales();
        // 注意：后端API需要返回推荐该书的帖子数据
        // loadRecommendingPosts();
    } catch (error) {
        console.error('加载书籍详情失败:', error);
        showMessage('加载书籍详情失败', 'danger');
    }
}

// 渲染书籍信息
function renderBookInfo(book) {
    const container = document.getElementById('bookInfoContainer');
    
    container.innerHTML = `
        <div class="row">
            <div class="col-md-3">
                ${book.cover_image ? 
                    `<img src="${book.cover_image}" alt="${book.title}" class="book-cover-large img-fluid">` :
                    `<div class="book-placeholder">
                        <i class="fas fa-book fa-3x"></i>
                    </div>`
                }
            </div>
            <div class="col-md-9">
                <h1 class="book-title">${book.title}</h1>
                <h5 class="text-muted">作者：${book.author}</h5>
                ${book.publisher ? 
                    `<p class="text-muted">出版社：${book.publisher}</p>` : ''
                }
                ${book.isbn ? 
                    `<p class="text-muted">ISBN：${book.isbn}</p>` : ''
                }
                ${book.description ? `
                    <div class="book-description mt-3">
                        <h6>书籍简介：</h6>
                        <p>${book.description.replace(/\n/g, '<br>')}</p>
                    </div>
                ` : ''}
            </div>
        </div>
    `;
}

// 加载出售信息
async function loadSales() {
    try {
        const data = await api.get(API_ENDPOINTS.BOOK_SALES, { book_id: bookId });
        const sales = data.results || data;
        renderSales(sales);
    } catch (error) {
        console.error('加载出售信息失败:', error);
        renderSales([]);
    }
}

// 渲染出售信息
function renderSales(sales) {
    const container = document.getElementById('salesContainer');
    
    if (!sales || sales.length === 0) {
        container.innerHTML = `
            <div class="text-center py-4">
                <i class="fas fa-store fa-3x text-muted mb-3"></i>
                <p class="text-muted">暂无出售信息</p>
                ${auth.isAuthenticated() ? `
                    <button class="btn btn-primary" onclick="addSale()">
                        <i class="fas fa-plus me-1"></i>我要出售这本书
                    </button>
                ` : ''}
            </div>
        `;
        return;
    }
    
    container.innerHTML = sales.map(sale => `
        <div class="sale-item glass-card p-3 mb-3">
            <div class="row align-items-center">
                <div class="col-md-8">
                    <h6 class="mb-1">
                        <i class="fas fa-user me-1"></i>${sale.seller_username || '匿名'}
                    </h6>
                    <p class="text-muted mb-1">
                        <span class="badge bg-success">${getConditionLabel(sale.condition)}</span>
                        <span class="ms-2">联系方式：${sale.contact_info}</span>
                    </p>
                    ${sale.notes ? `
                        <p class="text-muted small">${sale.notes}</p>
                    ` : ''}
                </div>
                <div class="col-md-4 text-end">
                    <h5 class="text-danger mb-0">￥${sale.price}</h5>
                    <small class="text-muted">${formatDate(sale.created_at).split(' ')[0]}</small>
                </div>
            </div>
        </div>
    `).join('');
}

// 获取新旧程度标签
function getConditionLabel(condition) {
    const labels = {
        'new': '全新',
        'good': '九成新',
        'fair': '八成新',
        'poor': '七成新以下'
    };
    return labels[condition] || condition;
}

// 添加出售信息
function addSale() {
    if (!auth.requireAuth()) return;
    window.location.href = `add-book-sale.html?book_id=${bookId}`;
}

// 加载推荐该书的帖子（如果后端API支持）
async function loadRecommendingPosts() {
    try {
        // 这需要后端提供相应的API
        // const posts = await postAPI.getPosts({ book_id: bookId });
        // renderRecommendingPosts(posts.results || posts);
    } catch (error) {
        console.error('加载推荐帖子失败:', error);
    }
}

// 渲染推荐帖子
function renderRecommendingPosts(posts) {
    if (!posts || posts.length === 0) {
        return;
    }
    
    const card = document.getElementById('recommendingPostsCard');
    const container = document.getElementById('recommendingPostsContainer');
    
    card.style.display = 'block';
    
    container.innerHTML = posts.slice(0, 5).map(post => `
        <div class="recommended-post mb-3">
            <h6 class="mb-1">
                <a href="post-detail.html?id=${post.id}" class="text-decoration-none">
                    ${truncate(post.title, 30)}
                </a>
            </h6>
            <small class="text-muted">
                <i class="fas fa-user me-1"></i>${post.author_username || '匿名'}
            </small>
        </div>
    `).join('');
}