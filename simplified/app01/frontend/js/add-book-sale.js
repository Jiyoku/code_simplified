// 添加书籍出售信息页面逻辑

let currentBook = null;
let bookId = null;

// 页面加载完成后执行
document.addEventListener('DOMContentLoaded', () => {
    // 检查登录状态
    if (!auth.requireAuth()) {
        return;
    }

    // 获取书籍ID
    bookId = getUrlParam('book_id');
    if (!bookId) {
        showMessage('书籍不存在', 'danger');
        setTimeout(() => {
            window.location.href = 'books.html';
        }, 1500);
        return;
    }

    // 加载书籍信息
    loadBookInfo();

    // 价格输入验证
    const priceInput = document.getElementById('price');
    if (priceInput) {
        priceInput.addEventListener('input', function() {
            let value = this.value;
            // 只允许数字和小数点
            value = value.replace(/[^\d.]/g, '');
            // 确保只有一个小数点
            const parts = value.split('.');
            if (parts.length > 2) {
                value = parts[0] + '.' + parts.slice(1).join('');
            }
            // 保留两位小数
            if (parts[1] && parts[1].length > 2) {
                value = parseFloat(value).toFixed(2);
            }
            this.value = value;
        });
    }
});

// 加载书籍信息
async function loadBookInfo() {
    try {
        const book = await bookAPI.getBook(bookId);
        currentBook = book;
        renderBookInfo(book);
    } catch (error) {
        console.error('加载书籍信息失败:', error);
        showMessage('加载书籍信息失败', 'danger');
    }
}

// 渲染书籍信息
function renderBookInfo(book) {
    const container = document.getElementById('bookInfoCard');
    
    container.innerHTML = `
        <div class="row align-items-center">
            <div class="col-md-2">
                ${book.cover_image ? 
                    `<img src="${book.cover_image}" alt="${book.title}" class="book-cover-preview img-fluid">` :
                    `<div class="book-placeholder-preview">
                        <i class="fas fa-book"></i>
                    </div>`
                }
            </div>
            <div class="col-md-10">
                <h4 class="mb-1">${book.title}</h4>
                <p class="text-muted mb-1">作者：${book.author}</p>
                ${book.publisher ? 
                    `<p class="text-muted small">出版社：${book.publisher}</p>` : ''
                }
            </div>
        </div>
    `;
}

// 处理创建出售信息
async function handleCreateSale(event) {
    event.preventDefault();
    
    const price = document.getElementById('price').value.trim();
    const condition = document.getElementById('condition').value;
    const contactInfo = document.getElementById('contact_info').value.trim();
    const notes = document.getElementById('notes').value.trim();
    
    // 验证
    if (!price || !condition || !contactInfo) {
        showMessage('请填写所有必填项', 'warning');
        return;
    }
    
    if (parseFloat(price) <= 0) {
        showMessage('价格必须大于0', 'warning');
        return;
    }
    
    try {
        const saleData = {
            book: bookId,
            price: parseFloat(price),
            condition: condition,
            contact_info: contactInfo,
            notes: notes
        };
        
        await api.post(API_ENDPOINTS.BOOK_SALES, saleData);
        showMessage('出售信息发布成功！', 'success');
        
        // 跳转到书籍详情页
        setTimeout(() => {
            window.location.href = `book-detail.html?id=${bookId}`;
        }, 1000);
    } catch (error) {
        console.error('发布出售信息失败:', error);
        showMessage(error.message || '发布失败，请重试', 'danger');
    }
}

// 返回上一页
function goBack() {
    if (bookId) {
        window.location.href = `book-detail.html?id=${bookId}`;
    } else {
        window.history.back();
    }
}