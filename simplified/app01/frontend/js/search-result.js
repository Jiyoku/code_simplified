document.addEventListener('DOMContentLoaded', () => {
    document
        .getElementById('searchBtn')
        .addEventListener('click', handleSearch);

    // 支持回车搜索
    document
        .getElementById('searchInput')
        .addEventListener('keypress', e => {
            if (e.key === 'Enter') handleSearch();
        });
});

async function handleSearch() {
    const keyword = document.getElementById('searchInput').value.trim();

    if (!keyword) {
        showMessage('请输入搜索关键词', 'warning');
        return;
    }

    try {
        const data = await api.get('/search/', {
            q: keyword
        });

        renderResults(keyword, data);
    } catch (err) {
        showMessage('搜索失败', 'danger');
        console.error(err);
    }
}

function renderResults(keyword, data) {
    const container = document.getElementById('resultArea');
    container.innerHTML = '';

    const { posts, books } = data;

    if ((!posts || posts.length === 0) && (!books || books.length === 0)) {
        container.innerHTML = `<p>很抱歉，没有相关结果</p>`;
        return;
    }

    container.innerHTML += `<h2>“${keyword}” 的搜索结果</h2>`;

    if (posts && posts.length) {
        container.innerHTML += `<h3>相关帖子</h3>`;
        posts.forEach(post => {
            container.innerHTML += `
                <div class="result-item">
                    <a href="post-detail.html?id=${post.id}">
                        ${post.title}
                    </a>
                </div>
            `;
        });
    }

    if (books && books.length) {
        container.innerHTML += `<h3>相关书籍</h3>`;
        books.forEach(book => {
            container.innerHTML += `
                <div class="result-item">
                    <a href="book-detail.html?id=${book.id}">
                        ${book.title} - ${book.author}
                    </a>
                </div>
            `;
        });
    }
}
