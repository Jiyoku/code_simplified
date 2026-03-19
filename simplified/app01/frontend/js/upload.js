document.addEventListener('DOMContentLoaded', () => {
    if (!auth.isAuthenticated()) {
        window.location.href = 'login.html';
        return;
    }

    document
        .getElementById('uploadForm')
        .addEventListener('submit', handleUpload);
});

async function handleUpload(e) {
    e.preventDefault();

    const formData = new FormData();

    formData.append('name', document.getElementById('name').value);
    formData.append('price', document.getElementById('price').value);
    formData.append('old_price', document.getElementById('old_price').value);
    formData.append('old_time', document.getElementById('old_time').value);
    formData.append('classification', document.getElementById('classification').value);
    formData.append('quantity', document.getElementById('quantity').value);
    formData.append('description', document.getElementById('description').value);

    const img = document.getElementById('img').files[0];
    if (img) formData.append('img', img);

    try {
        await api.post('/book-sales/', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });

        showMessage('发布成功！', 'success');

        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1000);

    } catch (err) {
        showMessage('发布失败', 'danger');
        console.error(err);
    }
}
