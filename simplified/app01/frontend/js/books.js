
const pageState = {
    currentPage: 1,
    pageSize: null,   
    totalCount: 0,
    totalPages: 0,
};

document.addEventListener('DOMContentLoaded', async () => {
    console.log('books.js loaded');
    const container = document.getElementById('booksContainer');
    if (!container) return;
    await loadBooks(1);
});

async function loadBooks(page) {
    const container = document.getElementById('booksContainer');
    container.innerHTML = `
        <div class="text-center p-5">
            <div class="spinner-border text-primary"></div>
        </div>`;

    const oldPag = document.getElementById('booksPagination');
    if (oldPag) oldPag.remove();

    try {
        // 不传 page_size，让后端用自己的默认值
        const data = await bookAPI.getBooks({ page });
        console.log('books api data:', data);

        let books, total;
        if (data && typeof data.count === 'number') {
            books = data.results || [];
            total = data.count;
        } else if (Array.isArray(data)) {
            books = data;
            total = data.length;
        } else {
            books = [];
            total = 0;
        }

        // 用后端实际返回的每页条数推算 pageSize（第1页最准）
        if (page === 1 && books.length > 0) {
            pageState.pageSize = books.length;
        }

        // pageSize 确定后才算 totalPages
        const pageSize = pageState.pageSize || books.length || 1;
        const totalPages = total > 0 ? Math.ceil(total / pageSize) : 0;

        // 防御：页码越界时退回第1页
        if (page > totalPages && totalPages > 0) {
            console.warn(`页码 ${page} 超出总页数 ${totalPages}，退回第1页`);
            return loadBooks(1);
        }

        pageState.currentPage = page;
        pageState.totalCount = total;
        pageState.totalPages = totalPages;

        console.log(`分页: 第${page}页 / 共${totalPages}页 / 总${total}条 / 每页${pageSize}条`);

        const countEl = document.getElementById('bookCount');
        if (countEl) countEl.textContent = total;

        renderBookList(books);
        renderPagination();

    } catch (e) {
        console.error(e);
        container.innerHTML = '<p class="text-danger text-center p-4">加载失败，请刷新重试</p>';
    }
}

function renderBookList(books) {
    const container = document.getElementById('booksContainer');
    container.innerHTML = '';

    if (!books || books.length === 0) {
        container.innerHTML = '<p class="text-muted text-center p-4">暂无书籍</p>';
        return;
    }

    const row = document.createElement('div');
    row.className = 'row g-4';

    books.forEach(book => {
        const col = document.createElement('div');
        col.className = 'col-lg-4 col-md-6 col-12';
        col.innerHTML = `
            <div class="book-card glass-card h-100">
                <div class="card-body p-3 d-flex flex-column">
                    <h5 class="mb-1">
                        <a href="book-detail.html?id=${book.id}" class="text-decoration-none text-dark">
                            ${escapeHtml(book.title)}
                        </a>
                    </h5>
                    <p class="text-muted small mb-1">
                        <i class="fas fa-pen-nib me-1"></i>作者：${escapeHtml(book.author || '未知')}
                    </p>
                    <p class="small flex-grow-1 mb-2 text-secondary">
                        ${escapeHtml(book.description || '')}
                    </p>
                    <small class="text-muted mt-auto">
                        <i class="fas fa-user me-1"></i>${escapeHtml(book.created_by_username || '')}
                    </small>
                </div>
            </div>
        `;
        row.appendChild(col);
    });

    container.appendChild(row);
}

function renderPagination() {
    const { currentPage, totalPages } = pageState;
    if (totalPages <= 1) return;

    const nav = document.createElement('nav');
    nav.id = 'booksPagination';
    nav.setAttribute('aria-label', '书籍分页');
    nav.className = 'mt-4';

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

    const container = document.getElementById('booksContainer');
    container.parentNode.insertBefore(nav, container.nextSibling);
}

function getPageNumbers(current, total) {
    if (total <= 7) {
        return Array.from({ length: total }, (_, i) => i + 1);
    }
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
            loadBooks(page);
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