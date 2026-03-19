document.addEventListener('DOMContentLoaded', () => {

    const tagsInput = document.getElementById('tags');
    const tagPreview = document.getElementById('tagPreview');

    tagsInput.addEventListener('input', () => {
        tagPreview.innerHTML = '';
        tagsInput.value
            .split(',')
            .map(t => t.trim())
            .filter(Boolean)
            .forEach(tag => {
                const span = document.createElement('span');
                span.className = 'tag-preview-item';
                span.innerHTML = `<i class="fas fa-tag me-1"></i>${tag}`;
                tagPreview.appendChild(span);
            });
    });

    document.getElementById('createPostForm').addEventListener('submit', async e => {
        e.preventDefault();
        e.stopPropagation();

        const title = document.getElementById('title').value.trim();
        const content = document.getElementById('content').value.trim();
        const tagsRaw = document.getElementById('tags').value;

        const data = {
            title: title,
            content: content,
            tag_names: tagsRaw
                .split(',')
                .map(t => t.trim())
                .filter(Boolean)
        };

        if (!data.title || !data.content) {
            showMessage('标题和内容不能为空', 'warning');
            return;
        }

        try {
            await api.post('/posts/', data);
            showMessage('帖子发布成功', 'success');
            setTimeout(() => location.href = 'posts.html', 1000);
        } catch (err) {
            console.error(err);
            showMessage('发布失败', 'danger');
        }
    });

});