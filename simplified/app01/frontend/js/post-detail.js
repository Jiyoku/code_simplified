// 帖子详情页面逻辑

let currentPost = null;
let postId = null;

// 页面加载完成后执行
document.addEventListener('DOMContentLoaded', () => {
    // 获取帖子ID
    postId = getUrlParam('id');
    if (!postId) {
        showMessage('帖子不存在', 'danger');
        setTimeout(() => {
            window.location.href = 'posts.html';
        }, 1500);
        return;
    }

    // 如果用户已登录，显示相关按钮
    if (auth.isAuthenticated()) {
        const createPostBtn = document.getElementById('createPostBtn');
        const myPostsBtn = document.getElementById('myPostsBtn');
        
        if (createPostBtn) createPostBtn.style.display = 'block';
        if (myPostsBtn) myPostsBtn.style.display = 'block';
    }

    // 加载帖子详情
    loadPostDetail();

    // 添加返回顶部按钮监听
    addScrollToTopButton();
});

// 加载帖子详情
async function loadPostDetail() {
    try {
        const post = await postAPI.getPost(postId);
        currentPost = post;
        
        renderPostDetail(post);
        renderAuthorInfo(post);
        renderTags(post);
    } catch (error) {
        console.error('加载帖子详情失败:', error);
        showMessage('加载帖子详情失败', 'danger');
        
        // 显示错误页面
        document.getElementById('postDetailContainer').innerHTML = `
            <div class="text-center py-5">
                <i class="fas fa-exclamation-circle fa-3x text-muted mb-3"></i>
                <h4 class="text-muted">加载失败</h4>
                <p class="text-muted">帖子不存在或已被删除</p>
                <a href="posts.html" class="btn btn-primary mt-3">
                    <i class="fas fa-arrow-left me-2"></i>返回帖子列表
                </a>
            </div>
        `;
    }
}

// 渲染帖子详情
function renderPostDetail(post) {
    const container = document.getElementById('postDetailContainer');
    const isAuthor = auth.isAuthenticated() && auth.user && auth.user.username === post.author_username;
    const isAuthenticated = auth.isAuthenticated();
    
    container.innerHTML = `
        <!-- 帖子标题 -->
        <div class="post-header mb-4">
            <h1 class="post-title">${post.title}</h1>
            
            <!-- 帖子信息 -->
            <div class="post-meta d-flex flex-wrap align-items-center justify-content-between mt-3">
                <div class="author-info d-flex align-items-center">
                    <div class="author-avatar me-3">
                        <div class="avatar-circle">
                            <i class="fas fa-user"></i>
                        </div>
                    </div>
                    <div>
                        <div class="author-name fw-bold">${post.author_username || '匿名'}</div>
                        <small class="text-muted">
                            <i class="fas fa-clock me-1"></i>${formatDate(post.created_at)}
                            ${post.updated_at !== post.created_at ? `
                                <span class="ms-2">
                                    <i class="fas fa-edit me-1"></i>已编辑
                                </span>
                            ` : ''}
                        </small>
                    </div>
                </div>
                <div class="post-stats d-flex align-items-center">
                    <span class="stat-item me-3">
                        <i class="fas fa-eye me-1"></i>${post.views || 0}
                    </span>
                    <span class="stat-item">
                        <i class="fas fa-heart me-1"></i>${post.likes || 0}
                    </span>
                </div>
            </div>

            <!-- 标签 -->
            ${(post.tags && post.tags.length > 0) ? `
                <div class="post-tags mt-3">
                    ${post.tags.map(tag => `
                        <a href="tag-posts.html?id=${tag.id}" class="tag-link text-decoration-none">
                            <span class="badge post-tag">
                                <i class="fas fa-tag me-1"></i>${tag.name}
                            </span>
                        </a>
                    `).join('')}
                </div>
            ` : ''}
        </div>

        <hr class="my-4">

        <!-- 帖子内容 -->
        <div class="post-content">
            <div class="content-text">
                ${post.content.replace(/\n/g, '<br>')}
            </div>
        </div>

        <hr class="my-4">

        <!-- 操作按钮 -->
        <div class="post-actions d-flex justify-content-between align-items-center">
            <div class="action-buttons">
                ${isAuthenticated ? `
                    <button onclick="handleLike()" class="btn btn-outline-danger btn-sm">
                        <i class="fas fa-heart me-1"></i>点赞 (${post.likes || 0})
                    </button>
                ` : ''}
                ${isAuthor ? `
                    <a href="edit-post.html?id=${post.id}" class="btn btn-outline-primary btn-sm ms-2">
                        <i class="fas fa-edit me-1"></i>编辑
                    </a>
                    <button onclick="handleDelete()" class="btn btn-outline-warning btn-sm ms-2">
                        <i class="fas fa-trash me-1"></i>删除
                    </button>
                ` : ''}
            </div>
            <div class="share-buttons">
                <button type="button" class="btn btn-outline-primary btn-sm" onclick="sharePost()">
                    <i class="fas fa-share me-1"></i>分享
                </button>
            </div>
        </div>
    `;
}

// 渲染作者信息
function renderAuthorInfo(post) {
    const card = document.getElementById('authorCard');
    const container = document.getElementById('authorInfo');
    
    card.style.display = 'block';
    
    container.innerHTML = `
        <div class="author-avatar-large mb-3">
            <div class="avatar-circle-large">
                <i class="fas fa-user"></i>
            </div>
        </div>
        <h6 class="author-name">${post.author_username || '匿名'}</h6>
        <p class="text-muted small">知识分享者</p>
    `;
}

// 渲染标签
function renderTags(post) {
    if (!post.tags || post.tags.length === 0) {
        return;
    }
    
    const card = document.getElementById('tagsCard');
    const container = document.getElementById('relatedTags');
    
    card.style.display = 'block';
    
    container.innerHTML = post.tags.map(tag => `
        <a href="tag-posts.html?id=${tag.id}" class="tag-link text-decoration-none">
            <span class="badge sidebar-tag mb-2">
                ${tag.name}
            </span>
        </a>
    `).join('');
}

// 点赞帖子
async function handleLike() {
    if (!auth.requireAuth()) return;
    
    try {
        const result = await postAPI.likePost(postId);
        showMessage('点赞成功！', 'success');
        
        // 重新加载帖子详情
        loadPostDetail();
    } catch (error) {
        console.error('点赞失败:', error);
        showMessage(error.message || '点赞失败', 'danger');
    }
}

// 删除帖子
async function handleDelete() {
    if (!confirm('确定要删除这篇帖子吗？此操作不可恢复！')) {
        return;
    }
    
    try {
        await postAPI.deletePost(postId);
        showMessage('帖子已删除', 'success');
        
        // 跳转到我的帖子页面
        setTimeout(() => {
            window.location.href = 'my-posts.html';
        }, 1000);
    } catch (error) {
        console.error('删除失败:', error);
        showMessage(error.message || '删除失败', 'danger');
    }
}

// 分享帖子
function sharePost() {
    if (navigator.share) {
        navigator.share({
            title: currentPost.title,
            text: truncate(currentPost.content, 100),
            url: window.location.href
        }).catch(err => console.log('分享失败:', err));
    } else {
        // 复制链接到剪贴板
        navigator.clipboard.writeText(window.location.href).then(() => {
            showMessage('链接已复制到剪贴板！', 'success');
        }).catch(err => {
            console.error('复制失败:', err);
            showMessage('复制失败，请手动复制链接', 'warning');
        });
    }
}

// 平滑滚动到顶部
function scrollToTop() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}

// 添加返回顶部按钮
function addScrollToTopButton() {
    window.addEventListener('scroll', function() {
        const scrollButton = document.getElementById('scrollToTop');
        
        if (window.pageYOffset > 300) {
            if (!scrollButton) {
                const button = document.createElement('button');
                button.id = 'scrollToTop';
                button.className = 'btn btn-primary rounded-circle position-fixed';
                button.style.cssText = 'bottom: 2rem; right: 2rem; z-index: 1000; width: 50px; height: 50px;';
                button.innerHTML = '<i class="fas fa-arrow-up"></i>';
                button.onclick = scrollToTop;
                document.body.appendChild(button);
            }
        } else {
            if (scrollButton) {
                scrollButton.remove();
            }
        }
    });
}