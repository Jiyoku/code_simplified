/* ============================================
   每日一句 数据
   ============================================ */
const DAILY_QUOTES = [
    { text: '读一本好书，就是和许多高尚的人谈话。', author: '歌德' },
    { text: '书籍是人类进步的阶梯。', author: '高尔基' },
    { text: '不读书的人，思想就会停止。', author: '狄德罗' },
    { text: '读书破万卷，下笔如有神。', author: '杜甫' },
    { text: '学而不思则罔，思而不学则殆。', author: '孔子' },
    { text: '知识就是力量。', author: '培根' },
    { text: '书籍是思想的蜂巢，每一格都储满了智慧。', author: '雨果' },
    { text: '阅读使人充实，会谈使人敏捷，写作使人精确。', author: '培根' },
    { text: '理想的书籍是智慧的钥匙。', author: '托尔斯泰' },
    { text: '书是人类用来征服世界的最好武器。', author: '高尔基' },
    { text: '敏而好学，不耻下问。', author: '孔子' },
    { text: '学习永远不晚。', author: '高尔基' },
    { text: '知识越多，创造力越大。', author: '培根' },
    { text: '生活里没有书籍，就好像没有阳光；智慧里没有书籍，就好像鸟儿没有翅膀。', author: '莎士比亚' },
    { text: '不学而求知，犹愿鱼而无网。', author: '葛洪' },
    { text: '读书之法，在循序渐进，熟读而精思。', author: '朱熹' },
    { text: '吾生也有涯，而知也无涯。', author: '庄子' },
    { text: '一日不读书，胸臆无佳想。', author: '萧抡谓' },
    { text: '人生最美好的，就是在你停止生存时，也还能以你所创造的一切为人们服务。', author: '奥斯特洛夫斯基' },
    { text: '志当存高远。', author: '诸葛亮' },
    { text: '路漫漫其修远兮，吾将上下而求索。', author: '屈原' },
    { text: '天行健，君子以自强不息。', author: '《周易》' },
    { text: '博学之，审问之，慎思之，明辨之，笃行之。', author: '《中庸》' },
    { text: '纸上得来终觉浅，绝知此事要躬行。', author: '陆游' },
    { text: '好书不厌百回读，熟读深思子自知。', author: '苏轼' },
    { text: '立身以立学为先，立学以读书为本。', author: '欧阳修' },
    { text: '三人行，必有我师焉。', author: '孔子' },
    { text: '不积跬步，无以至千里。', author: '荀子' },
    { text: '问渠那得清如许？为有源头活水来。', author: '朱熹' },
    { text: '少壮不努力，老大徒伤悲。', author: '《汉乐府》' },
    { text: '业精于勤，荒于嬉；行成于思，毁于随。', author: '韩愈' },
];

/* ============================================
   渲染英雄区：日期 + 每日一句
   ============================================ */
function renderHero() {
    const now = new Date();
    const weekDays = ['星期日','星期一','星期二','星期三','星期四','星期五','星期六'];
    const months = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'];
    
    const dateStr = `${now.getFullYear()}  ·  ${months[now.getMonth()]} ${String(now.getDate()).padStart(2,'0')}  ·  ${weekDays[now.getDay()]}`;
    
    // Pick quote by day of year so it changes daily but stays consistent within a day
    const dayOfYear = Math.floor((now - new Date(now.getFullYear(), 0, 0)) / 86400000);
    const q = DAILY_QUOTES[dayOfYear % DAILY_QUOTES.length];

    const dateEl  = document.getElementById('heroDate');
    const quoteEl = document.getElementById('heroQuote');
    const authorEl= document.getElementById('heroQuoteAuthor');

    if (dateEl)   dateEl.textContent  = dateStr;
    if (quoteEl)  quoteEl.textContent = q.text;
    if (authorEl) authorEl.textContent = q.author;
}

document.addEventListener('DOMContentLoaded', async () => {
    renderHero();
    try {
        await loadIndexData();
        updateAuthUI();
    } catch (err) {
        showMessage('首页数据加载失败', 'danger');
        console.error(err);
    }
});

async function loadIndexData() {
    const data = await postAPI.getIndexData();
    renderBooksEditorial(data.popular_books);
    renderPostsEditorial(data.recommended_posts);
    renderTagsWall(data.tags);
}

/* ============================================
   书籍 — 卡片式网格，第3张自动 featured
   ============================================ */
function renderBooksEditorial(books) {
    const grid = document.getElementById('booksGrid');
    if (!grid) return;
    grid.innerHTML = '';

    if (!books || !books.length) {
        grid.innerHTML = '<p style="color:var(--muted-on-dark);font-size:0.9rem;padding:1rem 0;">暂无书籍</p>';
        return;
    }

    books.forEach((book, i) => {
        const card = document.createElement('div');
        const isFeatured = (i % 5 === 2); // 每5张里第3张高亮
        card.className = 'book-card-ed' + (isFeatured ? ' featured' : '');
        card.onclick = () => { window.location.href = `book-detail.html?id=${book.id}`; };

        // Warm spine colours
        const spineColors = [
            ['#3d2b1f','#c8a06a'],['#1f2d3d','#8ab4c8'],
            ['#2d1f3d','#b48ac8'],['#1f3d2b','#8ac8a0'],
            ['#3d1f1f','#c88a8a'],['#2b2b1f','#c8c08a'],
        ];
        const h = [...(book.title||'')].reduce((a,c)=>a+c.charCodeAt(0),0);
        const [spBg, spFg] = spineColors[h % spineColors.length];
        const coverHTML = book.cover_image
            ? `<img class="book-cover-ed" src="${book.cover_image}" alt="${esc(book.title)}" loading="lazy">`
            : `<div class="book-cover-placeholder" style="background:${spBg};">
                <span class="book-spine-title" style="color:${spFg};">${esc(book.title)}</span>
               </div>`;

        card.innerHTML = `
            <div class="book-cover-wrap">${coverHTML}</div>
            <div class="book-info-ed">
                <div class="book-title-ed">${esc(trunc(book.title, 28))}</div>
                <div class="book-author-ed">${esc(book.author || '')}</div>
                <div class="book-rec-ed">
                    <i class="fas fa-heart" style="font-size:0.65rem;"></i>
                    ${book.recommendation_count || 0}
                </div>
            </div>`;
        grid.appendChild(card);
    });
}

/* ============================================
   帖子 — 报纸分栏，4列等宽
   ============================================ */

function renderPostsEditorial(posts) {
    const grid = document.getElementById('postsGrid');
    if (!grid) return;
    grid.innerHTML = '';

    if (!posts || !posts.length) {
        grid.innerHTML = '<p style="color:var(--muted-on-dark);font-size:0.9rem;padding:1rem 0;">暂无推荐帖子</p>';
        return;
    }

    // nth-child pattern (1-indexed): wide slots are 1,7,12 (span 5,7,12)
    const WIDE_SLOTS = new Set([1, 7, 12]);

    posts.forEach((post, i) => {
        const slot = (i % 12) + 1;          // 1–12 循环
        const isWide = WIDE_SLOTS.has(slot); // 宽卡片显摘要

        const card = document.createElement('div');
        card.className = 'post-card-ed';     // span 由 nth-child CSS 控制
        card.onclick = (e) => {
            if (e.target.tagName !== 'A') window.location.href = `post-detail.html?id=${post.id}`;
        };

        const tagsHTML = (post.tags || []).slice(0, isWide ? 3 : 2)
            .map(t => `<span class="post-tag-pill">${esc(t.name)}</span>`).join('');

        const showExcerpt = isWide && post.content;
        const excerptLen  = slot === 12 ? 200 : 110;

        card.innerHTML = `
            <div class="post-title-ed">
                <a href="post-detail.html?id=${post.id}">${esc(trunc(post.title, isWide ? 55 : 38))}</a>
            </div>
            ${showExcerpt
                ? `<div class="post-excerpt-ed">${esc(trunc(post.content, excerptLen))}</div>`
                : ''}
            ${tagsHTML ? `<div class="post-tags-ed">${tagsHTML}</div>` : ''}
            <div class="post-meta-ed">
                <span style="opacity:.7;">${esc(post.author_username || '匿名')}</span>
                <div class="post-stats-ed">
                    <span>↑ ${post.views || 0}</span>
                    <span>♥ ${post.likes || 0}</span>
                </div>
            </div>`;
        grid.appendChild(card);
    });
}

/* ============================================
   标签 — 大中小随机分配，视觉有节奏感
   ============================================ */
const TAG_SIZES = ['lg', '', 'sm', '', 'lg', 'sm', '', 'lg', 'sm', ''];

function renderTagsWall(tags) {
    const container = document.getElementById('tagsContainer');
    if (!container) return;
    container.innerHTML = '';

    if (!tags || !tags.length) {
        container.innerHTML = '<p style="color:var(--muted-on-dark);font-size:0.9rem;">暂无标签</p>';
        return;
    }

    tags.forEach((tag, i) => {
        const a = document.createElement('a');
        const sizeClass = TAG_SIZES[i % TAG_SIZES.length];
        a.href = `posts.html?tag_id=${tag.id}`;
        a.className = `tag-pill ${sizeClass}`;
        a.innerHTML = `
            <i class="fas fa-tag" style="font-size:0.65rem;opacity:0.6;"></i>
            ${esc(tag.name)}
            <span class="tag-count">${tag.post_count || 0}</span>`;
        container.appendChild(a);
    });
}

/* ============================================
   搜索
   ============================================ */
function handleSearch(event) {
    event.preventDefault();
    const q = document.getElementById('searchInput').value.trim();
    if (q) window.location.href = `search.html?q=${encodeURIComponent(q)}`;
}

/* ============================================
   登录态 UI
   ============================================ */
function updateAuthUI() {
    if (auth.isAuthenticated()) {
        const btn = document.getElementById('addBookBtn');
        if (btn) btn.style.display = 'inline-flex';
    }
}

/* ============================================
   工具函数
   ============================================ */
function trunc(text, len) {
    if (!text) return '';
    return text.length > len ? text.slice(0, len) + '…' : text;
}

function esc(text) {
    if (!text) return '';
    return String(text)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}