// ==================== 通用组件 ====================

function showMessage(message, type = 'info') {
    const messageArea = document.getElementById('messageArea');
    if (!messageArea) return;
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type} alert-dismissible fade show`;
    alertDiv.innerHTML = `${message}<button type="button" class="btn-close" data-bs-dismiss="alert"></button>`;
    messageArea.appendChild(alertDiv);
    setTimeout(() => alertDiv.remove(), 3000);
}

// 渲染导航
function renderNavbar() {
    const userDropdown = document.getElementById('userNavDropdown');
    const userBtn      = document.getElementById('userNavBtn');

    if (userDropdown) {
        const isAuth = auth.isAuthenticated();
        const uname  = auth.getUsername();
        if (isAuth) {
            if (userBtn) userBtn.textContent = uname || '账号';
            userDropdown.innerHTML = `
                <a href="account.html">个人中心</a>
                <a href="#" onclick="handleLogout(event)">退出登录</a>
            `;
        } else {
            if (userBtn) userBtn.textContent = '账号';
            userDropdown.innerHTML = `
                <a href="login.html">登录</a>
                <a href="register.html">注册</a>
            `;
        }
        return;
    }

    // 其他页面：传统导航栏
    const container = document.getElementById('navbar-container');
    if (!container) return;
    const isAuth = auth.isAuthenticated();
    const uname  = auth.getUsername();

    const authLinks = isAuth ? `
        <li class="nav-item"><a class="nav-link" href="create-post.html">帖子 - 分享</a></li>
        <li class="nav-item"><a class="nav-link" href="posts.html">帖子 - 全部</a></li>
        <li class="nav-item"><a class="nav-link" href="create-book.html">书籍 - 分享</a></li>
        <li class="nav-item"><a class="nav-link" href="books.html">书籍 - 全部</a></li>
        
    ` : '';

    const userLinks = isAuth ? `
        <li class="nav-item dropdown">
            <a class="nav-link dropdown-toggle" href="#" id="navbarDropdown" role="button"
               data-bs-toggle="dropdown" aria-expanded="false">${uname}</a>
            <ul class="dropdown-menu dropdown-menu-end" aria-labelledby="navbarDropdown">
                <li><a class="dropdown-item" href="account.html">个人中心</a></li>
                <li><hr class="dropdown-divider"></li>
                <li><a class="dropdown-item" href="#" onclick="handleLogout(event)">退出登录</a></li>
            </ul>
        </li>` : `
        <li class="nav-item"><a class="nav-link" href="login.html">登录</a></li>
        <li class="nav-item"><a class="nav-link" href="register.html">注册</a></li>`;

    container.innerHTML = `
        <nav class="navbar navbar-expand-lg navbar-light bg-light mb-4">
            <div class="container">
                <a class="navbar-brand" href="index.html">知识分享平台</a>
                <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
                    <span class="navbar-toggler-icon"></span>
                </button>
                <div class="collapse navbar-collapse" id="navbarNav">
                    <ul class="navbar-nav me-auto">
                        <li class="nav-item"><a class="nav-link" href="index.html">首页</a></li>
                        ${authLinks}
                    </ul>
                    <ul class="navbar-nav">${userLinks}</ul>
                </div>
            </div>
        </nav>`;
}

async function handleLogout(event) {
    event.preventDefault();
    if (confirm('确定要退出登录吗?')) await auth.logout();
}

// ==================== 通用渲染函数 ====================

function renderTags(tags, containerId) {
    const c = document.getElementById(containerId);
    if (!c) return;
    if (!tags || !tags.length) { c.innerHTML = '<p class="text-muted text-center">暂无标签</p>'; return; }
    c.innerHTML = tags.map(tag => `
        <a href="tag-posts.html?id=${tag.id}" class="tag-item text-decoration-none">
            <span class="badge tag-badge">
                <i class="fas fa-tag me-1"></i>${tag.name}
                <small class="ms-1">(${tag.post_count || 0})</small>
            </span>
        </a>`).join('');
}

function renderPosts(posts, containerId) {
    const c = document.getElementById(containerId);
    if (!c) return;
    if (!posts || !posts.length) { c.innerHTML = '<div class="col-12"><p class="text-center text-muted">暂无帖子</p></div>'; return; }
    c.innerHTML = posts.map(post => `
        <div class="col-lg-4 col-md-6 mb-4">
            <div class="card h-100">
                <div class="card-body">
                    <h5 class="card-title"><a href="post-detail.html?id=${post.id}" class="text-decoration-none text-dark">${truncate(post.title,50)}</a></h5>
                    <p class="card-text text-muted small">${truncate(post.content,100)}</p>
                    <div>${(post.tags||[]).slice(0,3).map(t=>`<span class="badge bg-light text-dark me-1">${t.name}</span>`).join('')}</div>
                    <div class="d-flex justify-content-between mt-2">
                        <small class="text-muted"><i class="fas fa-user me-1"></i>${post.author_username||'匿名'}</small>
                        <div>
                            <small class="text-muted me-2"><i class="fas fa-eye me-1"></i>${post.views||0}</small>
                            <small class="text-muted"><i class="fas fa-heart me-1"></i>${post.likes||0}</small>
                        </div>
                    </div>
                </div>
            </div>
        </div>`).join('');
}

function renderBooks(books, containerId) {
    const c = document.getElementById(containerId);
    if (!c) return;
    if (!books || !books.length) { c.innerHTML = '<div class="col-12"><p class="text-center text-muted">暂无书籍</p></div>'; return; }
    c.innerHTML = books.map(book => `
        <div class="col-lg-4 col-md-6 mb-4">
            <div class="card h-100">
                <div class="card-body">
                    ${book.cover_image ? `<img src="${book.cover_image}" class="img-fluid rounded mb-2" style="max-height:80px;object-fit:cover;" alt="">` : ''}
                    <h5 class="card-title"><a href="book-detail.html?id=${book.id}" class="text-decoration-none text-dark">${truncate(book.title,30)}</a></h5>
                    <p class="text-muted small">作者：${book.author}</p>
                    <p class="small">${truncate(book.description||'',80)}</p>
                    <small class="text-muted"><i class="fas fa-heart me-1"></i>${book.recommendation_count||0} 推荐</small>
                </div>
            </div>
        </div>`).join('');
}

// ==================== 工具函数 ====================

function truncate(text, length) {
    if (!text) return '';
    return text.length > length ? text.substring(0, length) + '...' : text;
}

function formatDate(dateString) {
    if (!dateString) return '';
    const d = new Date(dateString);
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}

function getUrlParam(name) {
    return new URLSearchParams(window.location.search).get(name);
}

document.addEventListener('DOMContentLoaded', () => {
    renderNavbar();
});