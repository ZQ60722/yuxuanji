window.onload = function () {
    const signUpButton = document.getElementById('signUp');
    const signInButton = document.getElementById('signIn');
    const container = document.querySelector('.container');
    const formSignup = document.getElementById('form1');
    const formSignin = document.getElementById('form2');
    const feedbackSignup = document.getElementById('feedbackSignup');
    const feedbackSignin = document.getElementById('feedbackSignin');

    // 从localStorage获取用户数据，如果没有则创建空数组
    let users = JSON.parse(localStorage.getItem('users')) || [];

    // 注册按钮点击事件
    signUpButton.addEventListener('click', () => {
        container.classList.add("right-panel-active");
    });

    // 登录按钮点击事件
    signInButton.addEventListener('click', () => {
        container.classList.remove("right-panel-active");
    });

    // 注册表单提交事件
    formSignup.addEventListener('submit', (event) => {
        event.preventDefault(); // 阻止表单默认提交行为

        // 获取表单数据
        const username = formSignup.querySelector('input[name="username"]').value;
        const account = formSignup.querySelector('input[name="account"]').value;
        const password = formSignup.querySelector('input[name="password"]').value;

        // 检查用户是否已存在
        const userExists = users.some(user => user.account === account);

        if (userExists) {
            feedbackSignup.textContent = '该账号已注册，请直接登录！';
            feedbackSignup.style.color = 'blue';
        } else {
            // 创建新用户
            const newUser = {
                username: username,
                account: account,
                password: password,
                registrationDate: new Date().toISOString()
            };

            // 添加到用户数组
            users.push(newUser);

            // 保存到localStorage
            localStorage.setItem('users', JSON.stringify(users));

            feedbackSignup.textContent = '注册成功！请登录';
            feedbackSignup.style.color = 'green';

            // 清空表单
            formSignup.reset();

            // 延迟后切换到登录界面
            setTimeout(() => {
                container.classList.remove("right-panel-active");
                feedbackSignup.textContent = '';
            }, 1500);
        }
    });

    // 登录表单提交事件
    formSignin.addEventListener('submit', (event) => {
        event.preventDefault(); // 阻止表单默认提交行为

        // 获取表单数据
        const account = formSignin.querySelector('input[type="text"]').value;
        const password = formSignin.querySelector('input[type="password"]').value;

        // 查找用户
        const user = users.find(user => user.account === account && user.password === password);

        if (user) {
            // 登录成功，保存当前用户信息
            localStorage.setItem('currentUser', JSON.stringify({
                username: user.username,
                account: user.account,
                loginTime: new Date().toISOString()
            }));

            feedbackSignin.textContent = '登录成功！正在跳转...';
            feedbackSignin.style.color = 'green';

            // 清空表单
            formSignin.reset();

            // 延迟后跳转到其他页面
            setTimeout(() => {
                // 这里可以替换为你想要跳转的页面
                window.location.href = 'myself.html';
                alert("登录成功，用户信息已保存，即将跳转到个人中心页面");
            }, 1500);
        } else {
            // 检查是账号不存在还是密码错误
            const accountExists = users.some(user => user.account === account);

            if (!accountExists) {
                feedbackSignin.textContent = '该账号不存在，请先注册！';
                feedbackSignin.style.color = 'blue';
            } else {
                feedbackSignin.textContent = '密码错误，请重试！';
                feedbackSignin.style.color = 'blue';
            }
        }
    });
    // 获取DOM元素
    const forgotPasswordLink = document.getElementById('forgotPasswordLink');
    const forgotPasswordModal = document.getElementById('forgotPasswordModal');
    const closeModal = document.querySelector('.close');
    const cancelReset = document.getElementById('cancelReset');
    const confirmReset = document.getElementById('confirmReset');
    const resetPhoneInput = document.getElementById('resetPhoneInput');
    const resetFeedback = document.getElementById('resetFeedback');

// 打开忘记密码模态框
    forgotPasswordLink.addEventListener('click', function(e) {
        e.preventDefault();
        forgotPasswordModal.style.display = 'block';
        resetPhoneInput.value = '';
        resetFeedback.textContent = '';
    });

// 关闭模态框
    closeModal.addEventListener('click', function() {
        forgotPasswordModal.style.display = 'none';
    });

    cancelReset.addEventListener('click', function() {
        forgotPasswordModal.style.display = 'none';
    });

// 点击模态框外部关闭
    window.addEventListener('click', function(e) {
        if (e.target === forgotPasswordModal) {
            forgotPasswordModal.style.display = 'none';
        }
    });

// 确认重置密码
    confirmReset.addEventListener('click', function() {
        const phoneNumber = resetPhoneInput.value.trim();

        // 验证手机号格式
        if (!/^1[3-9]\d{9}$/.test(phoneNumber)) {
            resetFeedback.textContent = '请输入有效的手机号码';
            resetFeedback.style.color = 'red';
            return;
        }

        // 从本地存储获取用户信息
        let users = JSON.parse(localStorage.getItem('users')) || [];

        // 查找匹配手机号的用户
        const userIndex = users.findIndex(user => user.phone === phoneNumber);

        if (userIndex === -1) {
            resetFeedback.textContent = '该手机号未注册，请检查后重试';
            resetFeedback.style.color = 'red';
            return;
        }

        // 重置密码为111222
        users[userIndex].password = '111222';
        localStorage.setItem('users', JSON.stringify(users));

        // 显示成功消息
        resetFeedback.textContent = '密码已重置为111222，请使用新密码登录';
        resetFeedback.style.color = 'green';

        // 3秒后关闭模态框
        setTimeout(function() {
            forgotPasswordModal.style.display = 'none';
        }, 3000);
    });

// 用户注册时保存手机号的示例代码（如果需要）
    function registerUser(username, password, phone) {
        let users = JSON.parse(localStorage.getItem('users')) || [];

        // 检查用户名是否已存在
        if (users.some(user => user.username === username)) {
            return false; // 用户名已存在
        }

        // 添加新用户
        users.push({
            username: username,
            password: password,
            phone: phone
        });

        // 保存到本地存储
        localStorage.setItem('users', JSON.stringify(users));
        return true; // 注册成功
    }

}
