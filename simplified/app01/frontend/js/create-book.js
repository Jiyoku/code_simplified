document.getElementById('bookForm').addEventListener('submit', async e => {
    e.preventDefault();

    const data = {
        title: title.value.trim(),
        author: author.value.trim(),
        publisher: publisher.value,
        publish_date: publish_date.value || null,
        isbn: isbn.value,
        description: description.value,
        cover_image: cover_image.value
    };

    if (!data.title || !data.author) {
        showMessage('书名和作者必填', 'warning');
        return;
    }

    try {
        await api.post('/books/', data);
        showMessage('书籍添加成功', 'success');
        setTimeout(() => location.href = 'books.html', 1000);
    } catch (e) {
        showMessage('添加失败', 'danger');
    }
});
