let deleteId = null;

async function loadMyPosts() {
    const posts = await api.get('/posts/my/');
    document.getElementById('postsContainer').innerHTML = posts.map(p => `
        <div class="glass-card p-4 mb-4">
            <h4>${p.title}</h4>
            <p class="text-muted">${p.content.slice(0, 120)}...</p>
            <small>浏览 ${p.views} · 点赞 ${p.likes}</small>
            <div class="mt-2">
                <a href="post-detail.html?id=${p.id}" class="btn btn-sm btn-outline-primary">查看</a>
                <button class="btn btn-sm btn-outline-danger"
                        onclick="openDelete(${p.id})">
                    删除
                </button>
            </div>
        </div>
    `).join('') || empty('暂无帖子');
}

function openDelete(id) {
    deleteId = id;
    new bootstrap.Modal(document.getElementById('deleteModal')).show();
}

document.getElementById('confirmDelete').onclick = async () => {
    await api.delete(`/posts/${deleteId}/`);
    loadMyPosts();
};

loadMyPosts();
