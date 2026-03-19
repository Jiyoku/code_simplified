// 注册页面逻辑

// 处理注册
async function handleRegister(event) {
    event.preventDefault();
    
    const username = document.getElementById('username').value.trim();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const password2 = document.getElementById('password2').value;
    
    // 前端验证
    if (!username || !email || !password || !password2) {
        showMessage('请填写所有字段', 'warning');
        return;
    }
    
    if (username.length < 3 || username.length > 150) {
        showMessage('用户名长度必须在3-150个字符之间', 'warning');
        return;
    }
    
    if (password.length < 8) {
        showMessage('密码至少需要8个字符', 'warning');
        return;
    }
    
    // 检查密码是否全是数字
    if (/^\d+$/.test(password)) {
        showMessage('密码不能全是数字', 'warning');
        return;
    }
    
    if (password !== password2) {
        showMessage('两次密码不一致', 'warning');
        return;
    }
    
    // 验证邮箱格式
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        showMessage('请输入有效的邮箱地址', 'warning');
        return;
    }
    
    try {
        const userData = {
            username: username,
            email: email,
            password: password,
            password2: password2
        };
        
        await auth.register(userData);
        showMessage('注册成功！正在跳转...', 'success');
        
        // 跳转到首页
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1000);
    } catch (error) {
        console.error('注册失败:', error);
        
        // 处理错误信息
        let errorMessage = '注册失败，请重试';
        
        if (error.message) {
            // 解析后端返回的错误信息
            try {
                const errorObj = JSON.parse(error.message);
                if (errorObj.username) {
                    errorMessage = '用户名已存在';
                } else if (errorObj.email) {
                    errorMessage = '邮箱已被注册';
                } else if (errorObj.password) {
                    errorMessage = errorObj.password.join(', ');
                } else {
                    errorMessage = error.message;
                }
            } catch (e) {
                errorMessage = error.message;
            }
        }
        
        showMessage(errorMessage, 'danger');
    }
}

// 页面加载完成后执行
document.addEventListener('DOMContentLoaded', () => {
    // 如果已经登录，直接跳转到首页
    if (auth.isAuthenticated()) {
        window.location.href = 'index.html';
        return;
    }

    // 添加实时验证
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    const password2Input = document.getElementById('password2');
    
    // 用户名验证
    if (usernameInput) {
        usernameInput.addEventListener('blur', function() {
            const value = this.value.trim();
            if (value && (value.length < 3 || value.length > 150)) {
                this.classList.add('is-invalid');
            } else {
                this.classList.remove('is-invalid');
            }
        });
    }
    
    // 密码验证
    if (passwordInput) {
        passwordInput.addEventListener('blur', function() {
            const value = this.value;
            if (value && value.length < 8) {
                this.classList.add('is-invalid');
            } else if (value && /^\d+$/.test(value)) {
                this.classList.add('is-invalid');
            } else {
                this.classList.remove('is-invalid');
            }
        });
    }
    
    // 确认密码验证
    if (password2Input) {
        password2Input.addEventListener('blur', function() {
            const password = passwordInput.value;
            const password2 = this.value;
            if (password2 && password !== password2) {
                this.classList.add('is-invalid');
            } else {
                this.classList.remove('is-invalid');
            }
        });
    }
});