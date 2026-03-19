document.addEventListener('DOMContentLoaded', () => {
    if (!auth.isAuthenticated()) {
        window.location.href = 'login.html';
        return;
    }

    loadAccount();
    bindSaveProfile();
});

async function loadAccount() {
    try {
        const data = await api.get('/account/');

        fillUserInfo(data.user, data.account);
        renderPosts(data.recent_posts);
        renderBooks(data.recent_books);
        renderSales(data.recent_sales);

    } catch (err) {
        showMessage('加载个人信息失败', 'danger');
        console.error(err);
    }
}

function fillUserInfo(user, account) {
    document.getElementById('username').value = user.username;
    document.getElementById('email').value = user.email || '';
    document.getElementById('firstName').value = user.first_name || '';
    document.getElementById('lastName').value = user.last_name || '';
    document.getElementById('bio').value = account.bio || '';
}

function renderPosts(posts) {
    const box = document.getElementById('myPostsContainer');
    if (!posts.length) {
        box.innerHTML = '<p class="text-muted">暂无帖子</p>';
        return;
    }

    box.innerHTML = posts.map(p => `
        <div class="border rounded p-2 mb-2">
            <strong>${p.title}</strong>
            <div class="text-muted small">
                👁 ${p.views} ❤️ ${p.likes}
            </div>
        </div>
    `).join('');
}

function renderBooks(books) {
    const box = document.getElementById('myBooksContainer');
    if (!books.length) {
        box.innerHTML = '<p class="text-muted">暂无书籍</p>';
        return;
    }

    box.innerHTML = books.map(b => `
        <div class="border rounded p-2 mb-2">
            ${b.title} <small class="text-muted">(${b.author})</small>
        </div>
    `).join('');
}

function renderSales(sales) {
    const box = document.getElementById('mySalesContainer');
    if (!sales.length) {
        box.innerHTML = '<p class="text-muted">暂无出售信息</p>';
        return;
    }

    box.innerHTML = sales.map(s => `
        <div class="border rounded p-2 mb-2 d-flex justify-content-between">
            <span>${s.book_title}</span>
            <span class="text-danger">￥${s.price}</span>
        </div>
    `).join('');
}

function bindSaveProfile() {
    document.getElementById('saveProfileBtn').addEventListener('click', async () => {
        try {
            await api.put('/account/', {
                email: document.getElementById('email').value,
                first_name: document.getElementById('firstName').value,
                last_name: document.getElementById('lastName').value,
                bio: document.getElementById('bio').value
            });

            showMessage('保存成功', 'success');
        } catch (err) {
            showMessage('保存失败', 'danger');
            console.error(err);
        }
    });
}
