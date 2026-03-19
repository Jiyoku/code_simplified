
// 处理登录
async function handleLogin(event) {
    event.preventDefault();
    
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;
    const submitButton = event.target.querySelector('button[type="submit"]');
    
    // 前端验证
    if (!username || !password) {
        showMessage('请输入用户名和密码', 'warning');
        return;
    }
    
    // 禁用提交按钮，防止重复提交
    submitButton.disabled = true;
    submitButton.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>登录中...';
    
    try {
        await auth.login(username, password);
        showMessage('登录成功！正在跳转...', 'success');
        
        // 跳转到首页或返回之前的页面
        setTimeout(() => {
            const returnUrl = getUrlParam('return') || 'index.html';
            window.location.href = returnUrl;
        }, 1000);
    } catch (error) {
        console.error('登录失败:', error);
        
        // 恢复按钮状态
        submitButton.disabled = false;
        submitButton.innerHTML = '<i class="fas fa-sign-in-alt me-2"></i>登录';
        
        // 显示错误信息
        let errorMessage = '登录失败，请检查用户名和密码';
        if (error.message) {
            if (error.message.includes('401') || error.message.includes('用户名或密码')) {
                errorMessage = '用户名或密码错误';
            } else if (error.message.includes('网络')) {
                errorMessage = '网络连接失败，请检查网络设置';
            } else {
                errorMessage = error.message;
            }
        }
        showMessage(errorMessage, 'danger');
        
        // 清空密码框
        document.getElementById('password').value = '';
        document.getElementById('password').focus();
    }
}