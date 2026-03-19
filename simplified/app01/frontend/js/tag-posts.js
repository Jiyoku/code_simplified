document.addEventListener('DOMContentLoaded', async () => {
    const params = new URLSearchParams(window.location.search);
    const tagId = params.get('id');

    if (!tagId) {
        showMessage('标签不存在', 'danger');
        return;
    }

    if (auth.isAuthenticated()) {
        document.getElementById('createPostBtn').style.display = 'inline-block';
        document.getElementById('sidebarCreatePost').style.display = 'inline-block';
    }

    try {
        const tag = await api.get(`/tags/${tagId}/`);
        document.getElementById('tagName').innerText = tag.name;
        document.getElementById('tagNameStrong').innerText = tag.name;
        document.getElementById('tagBadge').innerText = tag.name;
        document.getElementById('tagInfoName').innerText = tag.name;

        const data = await api.get('/posts/', { tag_id: tagId });
        const posts = data.results || (Array.isArray(data) ? data : []);
        const total = typeof data.count === 'number' ? data.count : posts.length;

        document.getElementById('postCount').innerText = total;
        document.getElementById('tagInfoCount').innerText = total + ' 篇';

        renderPosts(posts);

    } catch (e) {
        console.error(e);
        showMessage('加载失败', 'danger');
    }
});

function renderPosts(posts) {
    const container = document.getElementById('postsContainer');
    container.innerHTML = '';

    if (!posts || !posts.length) {
        container.innerHTML = `
            <div class="glass-card p-5 text-center">
                <i class="fas fa-search fa-3x text-muted mb-3"></i>
                <h4 class="text-muted">暂无相关帖子</h4>
            </div>`;
        return;
    }

    // 用和首页一样的 posts-editorial 网格
    container.className = 'posts-editorial';

    posts.forEach(post => {
        const excerpt = post.content
            ? escapeHtml(post.content.slice(0, 120)) + (post.content.length > 120 ? '…' : '')
            : '';

        const tagsHtml = (post.tags || [])
            .map(t => `<span class="post-tag-pill">${escapeHtml(t.name)}</span>`)
            .join('');

        const date = post.created_at
            ? post.created_at.slice(0, 10)
            : '';

        const div = document.createElement('div');
        div.className = 'post-card-ed';
        div.dataset.created = post.created_at || '';
        div.dataset.views = post.views || 0;
        div.dataset.likes = post.likes || 0;

        div.innerHTML = `
            <div class="post-title-ed">
                <a href="post-detail.html?id=${post.id}">${escapeHtml(post.title)}</a>
            </div>
            <p class="post-excerpt-ed">${excerpt}</p>
            ${tagsHtml ? `<div class="post-tags-ed">${tagsHtml}</div>` : ''}
            <div class="post-meta-ed">
                <span>${escapeHtml(post.author_username || '')}&nbsp;·&nbsp;${date}</span>
                <span class="post-stats-ed">
                    <span><i class="fas fa-eye"></i> ${post.views || 0}</span>
                    <span><i class="fas fa-heart"></i> ${post.likes || 0}</span>
                </span>
            </div>
        `;

        div.addEventListener('click', (e) => {
            if (!e.target.closest('a')) {
                window.location.href = `post-detail.html?id=${post.id}`;
            }
        });

        container.appendChild(div);
    });
}

// 排序：重新对 DOM 节点排序
function sortPosts(type) {
    const container = document.getElementById('postsContainer');
    const posts = Array.from(container.querySelectorAll('.post-card-ed'));

    posts.sort((a, b) => {
        if (type === '-created_at')
            return new Date(b.dataset.created) - new Date(a.dataset.created);
        if (type === '-views')
            return Number(b.dataset.views) - Number(a.dataset.views);
        if (type === '-likes')
            return Number(b.dataset.likes) - Number(a.dataset.likes);
        return 0;
    });

    posts.forEach(p => container.appendChild(p));
}

// 视图切换：grid 模式覆盖为 2 列均等，list 恢复编辑网格
function setView(view, btn) {
    const container = document.getElementById('postsContainer');
    document.querySelectorAll('.view-options .btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    if (view === 'grid') {
        container.style.gridTemplateColumns = 'repeat(2, 1fr)';
        container.style.gridAutoRows = 'auto';
    } else {
        // 恢复 CSS 里定义的 12 列拼贴布局
        container.style.gridTemplateColumns = '';
        container.style.gridAutoRows = '';
    }
}

function escapeHtml(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}