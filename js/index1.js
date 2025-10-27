document.addEventListener('DOMContentLoaded', function() {
    const items = document.querySelectorAll('.carousel-item');
    const nextBtn = document.getElementById('nextBtn');
    const prevBtn = document.getElementById('prevBtn');

    let currentIndex = 0;

    // 函数：显示指定索引的图片
    function showItem(index) {
        // 移除所有项目的 active 类
        items.forEach(item => item.classList.remove('active'));

        // 给当前项目添加 active 类
        items[index].classList.add('active');
    }

    // 函数：切换到下一张
    function nextItem() {
        currentIndex = (currentIndex + 1) % items.length; // 循环
        showItem(currentIndex);
    }

    // 函数：切换到上一张
    function prevItem() {
        currentIndex = (currentIndex - 1 + items.length) % items.length; // 循环
        showItem(currentIndex);
    }

    // 绑定按钮点击事件
    nextBtn.addEventListener('click', nextItem);
    prevBtn.addEventListener('click', prevItem);

    // (可选) 自动轮播
    let intervalId = setInterval(nextItem, 4000); // 每4秒切换一次

    // (可选) 鼠标悬停时暂停自动轮播
    const carousel = document.querySelector('.carousel-container');
    carousel.addEventListener('mouseenter', () => clearInterval(intervalId));
    carousel.addEventListener('mouseleave', () => intervalId = setInterval(nextItem, 4000));
    // 在这里获取所有DOM元素，确保它们都能被后续函数访问
    const authButtons = document.getElementById('authButtons');
    const userMenu = document.getElementById('userMenu');
    const loginBtn = document.getElementById('loginBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    const dropdownToggle = document.getElementById('dropdownToggle');
    const dropdownMenu = document.getElementById('dropdownMenu');
    const aboutBtn = document.getElementById('aboutBtn');
    const aboutModal = document.getElementById('aboutModal');
    const aboutModalContent = document.getElementById('aboutModalContent');
    const modalCloseBtn = document.querySelector('.modal-close');
    // 核心函数：根据 localStorage 的数据更新整个导航栏UI
    function updateNavbarUI() {
        // 1. 统一从 'currentUser' 获取当前登录用户信息
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        console.log('当前用户信息:', currentUser);

        // 2. 获取需要操作的DOM元素
        const userNameElement = document.querySelector('.user-name');
        const userAvatarElement = document.querySelector('.user-avatar');

        if (currentUser) {
            // 如果 currentUser 存在，说明已登录
            authButtons.style.display = 'none';
            userMenu.classList.add('active');

            // 更新用户名
            if (userNameElement) {
                userNameElement.textContent = currentUser.username || "用户";
            }

            // 更新头像
            if (userAvatarElement) {
                if (currentUser.avatar) {
                    // 如果有头像，就显示头像
                    userAvatarElement.style.backgroundImage = `url(${currentUser.avatar})`;
                    userAvatarElement.style.backgroundSize = 'cover';
                    userAvatarElement.style.backgroundPosition = 'center';
                    userAvatarElement.textContent = ''; // 清空可能存在的文字
                } else {
                    // 如果没有头像，就显示用户名的第一个字作为默认头像
                    userAvatarElement.style.backgroundImage = 'none';
                    userAvatarElement.textContent = (currentUser.username || '用').charAt(0);
                }
            }
        } else {
            // 如果 currentUser 不存在，说明未登录
            authButtons.style.display = 'flex';
            userMenu.classList.remove('active');
        }
    }

    // 登录按钮点击事件
    if (loginBtn) {
        loginBtn.addEventListener('click', function(e) {
            e.preventDefault();
            window.location.href = 'pages/loading.html';
        });
    }

    // 退出登录按钮点击事件
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            localStorage.removeItem('currentUser');
            updateNavbarUI(); // 更新UI
            window.location.href = 'pages/loading.html'; // 跳转到首页
        });
    }

    // 用户下拉菜单切换
    if (dropdownToggle && dropdownMenu) {
        dropdownToggle.addEventListener('click', function(e) {
            e.stopPropagation();
            dropdownMenu.classList.toggle('show');
        });

        // 点击页面其他地方关闭下拉菜单
        document.addEventListener('click', function(e) {
            if (!dropdownToggle.contains(e.target) && !dropdownMenu.contains(e.target)) {
                dropdownMenu.classList.remove('show');
            }
        });
    }

    // 导航链接点击事件
    const navLinks = document.querySelectorAll('nav ul li a');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            // 如果是当前页面，阻止默认跳转
            if (this.getAttribute('href') === '#') {
                e.preventDefault();
            }

            // 移除所有active类
            navLinks.forEach(l => l.classList.remove('active'));

            // 给当前点击的链接添加active类
            this.classList.add('active');
        });
    });

    // 页面加载时，检查并更新UI
    updateNavbarUI();
});
