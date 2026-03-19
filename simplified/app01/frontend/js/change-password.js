document.addEventListener('DOMContentLoaded', () => {
    // 未登录直接踢回登录页
    if (!auth.isAuthenticated()) {
        window.location.href = 'login.html';
        return;
    }

    document.getElementById('submitBtn')
        .addEventListener('click', handleChangePassword);
});

async function handleChangePassword() {
    const password1 = document.getElementById('password1').value;
    const password2 = document.getElementById('password2').value;

    if (!password1 || !password2) {
        showMessage('请填写完整', 'warning');
        return;
    }

    if (password1 !== password2) {
        showMessage('两次密码不一致', 'danger');
        return;
    }

    try {
        await api.put('/change_password/', {
            new_password: password1,
            confirm_password: password2
        });

        showMessage('密码修改成功，请重新登录', 'success');

        // 后端已经删除 token，这里前端也清理
        auth.logout();

        setTimeout(() => {
            window.location.href = 'login.html';
        }, 1200);

    } catch (err) {
        showMessage(err.message || '修改失败', 'danger');
        console.error(err);
    }
}
