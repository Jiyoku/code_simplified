async function loadMyBooks() {
    const created = await api.get('/books/my-created/');
    const selling = await api.get('/books/my-selling/');

    document.getElementById('createdCount').textContent = created.length;
    document.getElementById('sellingCount').textContent = selling.length;

    document.getElementById('createdBooks').innerHTML = created.map(b => `
        <div class="glass-card p-3 mb-3">
            <h6><a href="book-detail.html?id=${b.id}">${b.title}</a></h6>
            <small class="text-muted">${b.author}</small>
        </div>
    `).join('') || empty('还没有添加书籍');

    document.getElementById('sellingBooks').innerHTML = selling.map(s => `
        <div class="glass-card p-3 mb-3">
            <h6>${s.book.title}</h6>
            <small class="text-danger">￥${s.price}</small>
            <button class="btn btn-sm btn-outline-danger mt-2"
                onclick="deleteSale(${s.id})">
                删除
            </button>
        </div>
    `).join('') || empty('暂无出售信息');
}

function empty(text) {
    return `<div class="text-muted text-center py-4">${text}</div>`;
}

async function deleteSale(id) {
    if (!confirm('确认删除？')) return;
    await api.delete(`/sales/${id}/`);
    loadMyBooks();
}

loadMyBooks();
