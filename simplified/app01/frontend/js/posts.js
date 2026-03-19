// 分页状态 —— 强制每页7条
const pageState = {
    currentPage: 1,
    pageSize: 7,
    totalCount: 0,
    totalPages: 0,
};

let currentSort = '-created_at';
let allPosts = []; // 缓存所有帖子，前端分页

document.addEventListener('DOMContentLoaded', () => {
    if (auth.isAuthenticated()) {
        const createPostBtn = document.getElementById('createPostBtn');
        const myPostsBtn = document.getElementById('myPostsBtn');
        const createPostSideBtn = document.getElementById('createPostSideBtn');
        if (createPostBtn) createPostBtn.style.display = 'inline-block';
        if (myPostsBtn) myPostsBtn.style.display = 'block';
        if (createPostSideBtn) createPostSideBtn.style.display = 'block';
    }

    loadPosts();
    loadTags();

    const sortSelect = document.getElementById('sortSelect');
    if (sortSelect) {
        sortSelect.addEventListener('change', function () {
            currentSort = this.value;
            sortAndRender();
        });
    }
});

// 一次性拉取所有帖子，前端分页
async function loadPosts() {
    const container = document.getElementById('postsContainer');
    container.innerHTML = `
        <div class="text-center p-5">
            <div class="spinner-border text-primary"></div>
        </div>`;

    try {
        // 拉第一页，看 count，再拉剩余页
        const first = await postAPI.getPosts({ page: 1 });
        const total = typeof first.count === 'number' ? first.count : (first.results || first).length;
        let posts = first.results || (Array.isArray(first) ? first : []);

        // 如果后端有多页，全部拉回来
        if (first.next) {
            let page = 2;
            while (true) {
                const d = await postAPI.getPosts({ page });
                const r = d.results || [];
                posts = posts.concat(r);
                if (!d.next) break;
                page++;
            }
        }

        allPosts = posts;

        const postCount = document.getElementById('postCount');
        if (postCount) postCount.textContent = total;

        pageState.totalCount = total;
        pageState.totalPages = Math.ceil(total / pageState.pageSize);

        renderRecommendedPosts(posts.slice(0, 3));
        showPage(1);

    } catch (error) {
        console.error('加载帖子失败:', error);
        showMessage('加载帖子失败', 'danger');
        renderEmptyState();
    }
}

function sortAndRender() {
    const sorted = [...allPosts];
    sorted.sort((a, b) => {
        if (currentSort === '-created_at') return new Date(b.created_at) - new Date(a.created_at);
        if (currentSort === '-views') return (b.views || 0) - (a.views || 0);
        if (currentSort === '-likes') return (b.likes || 0) - (a.likes || 0);
        return 0;
    });
    allPosts = sorted;
    showPage(1);
}

function showPage(page) {
    pageState.currentPage = page;

    const start = (page - 1) * pageState.pageSize;
    const slice = allPosts.slice(start, start + pageState.pageSize);

    renderPostsList(slice, pageState.pageSize);
    renderPagination();

    const oldPag = document.getElementById('postsPagination');
    // pagination已在renderPagination里处理
}

function renderPostsList(posts, pageSize) {
    const container = document.getElementById('postsContainer');

    if (!posts || posts.length === 0) {
        renderEmptyState();
        return;
    }

    container.innerHTML = posts.map(post => `
        <div class="glass-card post-item mb-4"
             data-created="${post.created_at}"
             data-views="${post.views || 0}"
             data-likes="${post.likes || 0}">
            <div class="card-body p-4">
                <div class="row">
                    <div class="col-md-9">
                        <h4 class="post-title mb-2">
                            <a href="post-detail.html?id=${post.id}" class="text-decoration-none text-dark">
                                ${escapeHtml(post.title)}
                            </a>
                        </h4>
                        <p class="post-excerpt text-muted mb-3">
                            ${escapeHtml(truncate(post.content, 150))}
                        </p>
                        ${(post.tags && post.tags.length > 0) ? `
                            <div class="post-tags mb-3">
                                ${post.tags.slice(0, 4).map(tag => `
                                    <a href="tag-posts.html?id=${tag.id}" class="text-decoration-none">
                                        <span class="badge post-tag me-1 mb-1">
                                            <i class="fas fa-tag me-1"></i>${escapeHtml(tag.name)}
                                        </span>
                                    </a>
                                `).join('')}
                                ${post.tags.length > 4 ? `<span class="badge bg-light text-dark">+${post.tags.length - 4}</span>` : ''}
                            </div>
                        ` : ''}
                        <div class="post-meta d-flex flex-wrap align-items-center">
                            <div class="author-info me-4">
                                <i class="fas fa-user me-1"></i>
                                <span class="fw-bold">${escapeHtml(post.author_username || '匿名')}</span>
                            </div>
                            <div class="post-date me-4">
                                <i class="fas fa-clock me-1"></i>
                                <span>${formatDate(post.created_at)}</span>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-3">
                        <div class="post-stats text-center">
                            <div class="stat-item mb-2">
                                <div class="stat-number">${post.views || 0}</div>
                                <div class="stat-label"><i class="fas fa-eye me-1"></i>浏览</div>
                            </div>
                            <div class="stat-item">
                                <div class="stat-number text-danger">${post.likes || 0}</div>
                                <div class="stat-label"><i class="fas fa-heart me-1"></i>点赞</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `).join('');

    // 补空占位卡片
    const ghostCount = pageSize - posts.length;
    for (let i = 0; i < ghostCount; i++) {
        const ghost = document.createElement('div');
        ghost.className = 'glass-card post-item mb-4';
        ghost.style.cssText = 'opacity:0; pointer-events:none; min-height:120px;';
        container.appendChild(ghost);
    }
}

function renderEmptyState() {
    const container = document.getElementById('postsContainer');
    container.innerHTML = `
        <div class="glass-card p-5 text-center">
            <div class="empty-state">
                <i class="fas fa-inbox fa-3x text-muted mb-3"></i>
                <h4 class="text-muted">暂无帖子</h4>
                <p class="text-muted">成为第一个分享知识的人吧！</p>
                ${auth.isAuthenticated() ? `
                    <a href="create-post.html" class="btn btn-primary mt-3">
                        <i class="fas fa-plus me-2"></i>发布第一篇帖子
                    </a>` : ''}
            </div>
        </div>`;
}

async function loadTags() {
    try {
        const tags = await tagAPI.getTags();
        renderHotTags(tags.results || tags);
    } catch (error) {
        console.error('加载标签失败:', error);
    }
}

function renderHotTags(tags) {
    const container = document.getElementById('hotTags');
    if (!tags || tags.length === 0) {
        container.innerHTML = '<p class="text-muted small">暂无标签</p>';
        return;
    }
    container.innerHTML = tags.slice(0, 5).map(tag => `
        <a href="tag-posts.html?id=${tag.id}" class="badge sidebar-tag me-1 mb-2">
            ${escapeHtml(tag.name)}
        </a>
    `).join('');
}

function renderRecommendedPosts(posts) {
    const container = document.getElementById('recommendedPosts');
    if (!posts || posts.length === 0) {
        container.innerHTML = '<p class="text-muted small">暂无推荐</p>';
        return;
    }
    container.innerHTML = posts.map(post => `
        <div class="recommended-item mb-3">
            <h6 class="mb-1">
                <a href="post-detail.html?id=${post.id}" class="text-decoration-none">
                    ${escapeHtml(truncate(post.title, 40))}
                </a>
            </h6>
            <small class="text-muted">
                <i class="fas fa-eye me-1"></i>${post.views || 0}
                <i class="fas fa-heart ms-2 me-1"></i>${post.likes || 0}
            </small>
        </div>
    `).join('');
}

function renderPagination() {
    const old = document.getElementById('postsPagination');
    if (old) old.remove();

    const { currentPage, totalPages } = pageState;
    if (totalPages <= 1) return;

    const nav = document.createElement('nav');
    nav.id = 'postsPagination';
    nav.setAttribute('aria-label', '帖子分页');
    nav.className = 'mt-4 mb-2';

    const ul = document.createElement('ul');
    ul.className = 'pagination justify-content-center flex-wrap';

    ul.appendChild(createPageItem('«', currentPage - 1, currentPage === 1));

    getPageNumbers(currentPage, totalPages).forEach(p => {
        if (p === '...') {
            const li = document.createElement('li');
            li.className = 'page-item disabled';
            li.innerHTML = '<span class="page-link">…</span>';
            ul.appendChild(li);
        } else {
            ul.appendChild(createPageItem(p, p, false, p === currentPage));
        }
    });

    ul.appendChild(createPageItem('»', currentPage + 1, currentPage >= totalPages));
    nav.appendChild(ul);

    const container = document.getElementById('postsContainer');
    container.parentNode.insertBefore(nav, container.nextSibling);
}

function getPageNumbers(current, total) {
    if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
    const pages = [];
    const left = Math.max(2, current - 1);
    const right = Math.min(total - 1, current + 1);
    pages.push(1);
    if (left > 2) pages.push('...');
    for (let i = left; i <= right; i++) pages.push(i);
    if (right < total - 1) pages.push('...');
    pages.push(total);
    return pages;
}

function createPageItem(label, page, disabled, active = false) {
    const li = document.createElement('li');
    li.className = `page-item${disabled ? ' disabled' : ''}${active ? ' active' : ''}`;
    const a = document.createElement('a');
    a.className = 'page-link';
    a.href = '#';
    a.textContent = label;
    if (!disabled && !active) {
        a.addEventListener('click', (e) => {
            e.preventDefault();
            if (page < 1 || page > pageState.totalPages) return;
            window.scrollTo({ top: 0, behavior: 'smooth' });
            showPage(page);
        });
    }
    li.appendChild(a);
    return li;
}

function escapeHtml(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}