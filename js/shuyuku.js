document.addEventListener('DOMContentLoaded', function() {
    // 初始化数据
    let recentData = [];
    let frequentData = [
        {source: 'Wheat', target: '小麦', category: '农学'},
        {source: 'conductivity', target: '导电性', category: '材料学'},
        {source: 'Social Mobility', target: '社会流动', category: '社会学'},
        {source: 'Currency', target: '货币', category: '金融'},
        {source: 'Cell', target: '细胞', category: '生命科学'},
        {source: 'Theory', target: '理论', category: '教育学'},
        {source: 'Perception', target: '知觉', category: '心理学'},
        {source: 'Organism', target: '生物', category: '环境科学'},
        {source: 'Homestay', target: '民宿', category: '旅游'}
    ];
    let filePath = '';
    let activeFilter = 'recent';

    // 加载本地存储的术语
    loadSavedTerms();

    // 渲染术语列表
    renderTermLists();

    // 搜索功能
    const searchInput = document.getElementById('searchInput');
    searchInput.addEventListener('input', function (e) {
        const searchTerm = e.target.value.trim();
        if (searchTerm) {
            fetch(`http://127.0.0.1:5000/search?term=${encodeURIComponent(searchTerm)}`)
                .then(response => response.json())
                .then(data => {
                    displaySearchResults(data);
                })
                .catch(error => {
                    console.error('搜索出错:', error);
                });
        } else {
            clearSearchResults();
        }
    });

    // 过滤标签切换
    const filterTags = document.querySelectorAll('.filter-tag');
    filterTags.forEach(tag => {
        tag.addEventListener('click', function () {
            // 更新活动标签样式
            filterTags.forEach(t => t.classList.remove('active'));
            this.classList.add('active');

            // 更新活动过滤器
            activeFilter = this.dataset.filter;

            // 切换显示内容
            if (activeFilter === 'recent') {
                document.getElementById('recentContent').style.display = 'block';
                document.getElementById('frequentContent').style.display = 'none';
            } else {
                document.getElementById('recentContent').style.display = 'none';
                document.getElementById('frequentContent').style.display = 'block';
            }
        });
    });

    // 添加术语按钮
    const addTermBtn = document.getElementById('addTermBtn');
    const addTermModal = document.getElementById('addTermModal');
    const closeModal = document.querySelector('.close');
    const cancelAddTerm = document.getElementById('cancelAddTerm');
    const confirmAddTerm = document.getElementById('confirmAddTerm');

    addTermBtn.addEventListener('click', function () {
        addTermModal.style.display = 'block';
        // 清空表单
        document.getElementById('sourceTerm').value = '';
        document.getElementById('targetTerm').value = '';
        document.getElementById('category').value = '';
    });

    closeModal.addEventListener('click', function () {
        addTermModal.style.display = 'none';
    });

    cancelAddTerm.addEventListener('click', function () {
        addTermModal.style.display = 'none';
    });

    confirmAddTerm.addEventListener('click', function () {
        const sourceTerm = document.getElementById('sourceTerm').value.trim();
        const targetTerm = document.getElementById('targetTerm').value.trim();
        const category = document.getElementById('category').value.trim();

        if (!sourceTerm || !targetTerm) {
            alert('源语言和目标语言术语不能为空');
            return;
        }

        // 创建新术语对象
        const newTerm = {
            id: recentData.length + 1,
            source: sourceTerm,
            target: targetTerm,
            category: category,
            date: new Date().toISOString().split('T')[0],
            views: 0
        };

        // 添加到最近添加列表
        recentData.push(newTerm);

        // 保存到本地存储
        saveTerms();

        // 重新渲染列表
        renderTermLists();

        // 关闭对话框
        addTermModal.style.display = 'none';

        // 显示成功提示
        showToast('术语添加成功');
    });

    // 文件上传
    const uploadBox = document.getElementById('uploadBox');
    const fileInput = document.getElementById('fileInput');
    const uploadPreview = document.getElementById('uploadPreview');
    const uploadText = document.getElementById('uploadText');
    const recognizeBtn = document.getElementById('recognizeBtn');
    let uploadFilePath = null;
    uploadBox.addEventListener('click', function () {
        fileInput.click();
    });

    fileInput.addEventListener('change', function (e) {
        const file = e.target.files[0];
        if (!file) return;

        const fileExtension = file.name.split('.').pop().toLowerCase();
        if (fileExtension !== 'txt' && fileExtension !== 'docx') {
            showToast('请上传txt或docx格式的文件');
            return;
        }

        // 创建FormData对象
        const formData = new FormData();
        formData.append('file', file);

        // 上传文件
        fetch('http://127.0.0.1:5000/upload', {
            method: 'POST',
            body: formData
        })
            .then(response => response.json())
            .then(data => {
                if (data.success && data.filePath) {
                    uploadFilePath = data.filePath;

                    // 根据文件类型显示不同图标
                    let iconPath = '';
                    if (fileExtension === 'docx') {
                        iconPath = '../backend/lan/docx.png';
                    } else if (fileExtension === 'txt') {
                        iconPath = '../backend/lan/txt.png';
                    } else {
                        iconPath = '../backend/lan/default.png';
                    }

                    // 显示预览
                    uploadPreview.src = iconPath;
                    uploadPreview.style.display = 'block';
                    uploadText.style.display = 'none';

                    showToast('上传成功');
                } else {
                    showToast('上传成功但处理异常');
                }
            })
            .catch(error => {
                console.error('上传失败:', error);
                showToast('上传失败');
            });
    });

    // 术语识别按钮

    recognizeBtn.addEventListener('click', function () {
        if (!uploadFilePath) {
            showToast('请先上传文件');
            return;
        }
        performRecognition(uploadFilePath);
    });
    document.getElementById("closeResultBtn").addEventListener('click', closeResultPanel)

    document.addEventListener('DOMContentLoaded', function() {
        // 1. 页面加载时，检查URL中是否有filePath参数
        const urlParams = new URLSearchParams(window.location.search);
        const filePath = urlParams.get('uploadFilePath');

        if (filePath) {
            // 如果有filePath，说明是从上传页面跳转过来的，直接开始识别
            performRecognition(filePath);
        } else {
            // 如果没有filePath，说明是直接访问此页面，可以隐藏上传框或显示提示
            console.log('未检测到文件路径，请先上传文件。');
            // 例如，可以禁用识别按钮
            const recognizeBtn = document.getElementById('recognizeBtn');
            if(recognizeBtn) recognizeBtn.style.display = 'none';
        }

        // 2. 绑定关闭按钮的事件
        const closeBtn = document.getElementById('closeResultBtn');
        if (closeBtn) {
            closeBtn.addEventListener('click', closeResultPanel);
        }
    });

    // ==================== 识别功能核心函数 ====================

    function performRecognition(filePath) {
        const resultOverlay = document.getElementById('resultOverlay');
        const resultContent = document.getElementById('resultContent');

        // 显示浮动盒子
        resultOverlay.style.display = 'flex';
        // 使用 setTimeout 确保动画生效
        setTimeout(() => resultOverlay.classList.add('show'), 10);

        // 显示加载中状态
        resultContent.innerHTML = '<p style="text-align: center; color: #999;">正在识别中，请稍候...</p>';

        // 发送识别请求到后端
        fetch('http://127.0.0.1:5000/translate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ filePath: filePath })
        })
            .then(response => response.json())
            .then(data => {
                if (data.success && data.translations) {
                    renderRecognitionResults(data.translations);
                } else {
                    throw new Error(data.message || '识别失败');
                }
            })
            .catch(error => {
                console.error('识别失败:', error);
                resultContent.innerHTML = `<p style="text-align: center; color: red;">识别出错: ${error.message}</p>`;
            });
    }

    function renderRecognitionResults(results) {
        const resultContent = document.getElementById('resultContent');
        if (!results || results.length === 0) {
            resultContent.innerHTML = '<p style="text-align: center;">未识别到任何术语。</p>';
            return;
        }

        let html = '';
        results.forEach(item => {
            // 假设后端返回的数据结构是 {original_text: '...', translated_text: '...'}
            html += `
            <div class="translation-item">
                <p class="original">原文：${item.original_text}</p>
                <p class="translated">识别/翻译：${item.translated_text}</p>
            </div>
        `;
        });
        resultContent.innerHTML = html;
    }

    function closeResultPanel() {
        const resultOverlay = document.getElementById('resultOverlay');
        resultOverlay.classList.remove('show');
        // 等待CSS动画结束后再隐藏元素
        setTimeout(() => {
            resultOverlay.style.display = 'none';
        }, 400);
    }

    // 辅助函数
    function loadSavedTerms() {
        const savedTerms = localStorage.getItem('savedTerms');
        if (savedTerms) {
            recentData = JSON.parse(savedTerms);
        }
    }

    function saveTerms() {
        localStorage.setItem('savedTerms', JSON.stringify(recentData));
    }

    function renderTermLists() {
        // 渲染最近添加
        const recentContent = document.getElementById('recentContent');
        recentContent.innerHTML = '';
        recentData.forEach(term => {
            const termElement = createTermElement(term);
            recentContent.appendChild(termElement);
        });

        // 渲染常用术语
        const frequentContent = document.getElementById('frequentContent');
        frequentContent.innerHTML = '';
        frequentData.forEach(term => {
            const termElement = createTermElement(term);
            frequentContent.appendChild(termElement);
        });
    }

    function createTermElement(term) {
        const termDiv = document.createElement('div');
        termDiv.className = 'item';

        const cardDiv = document.createElement('div');
        cardDiv.className = 'card';

        const termItemDiv = document.createElement('div');
        termItemDiv.className = 'term-item';

        const termHeaderDiv = document.createElement('div');
        termHeaderDiv.className = 'term-header';

        const sourceText = document.createElement('span');
        sourceText.className = 'font-medium';
        sourceText.textContent = term.source;

        const categoryText = document.createElement('span');
        categoryText.className = 'term-category';
        categoryText.textContent = term.category;

        const translationDiv = document.createElement('div');
        translationDiv.className = 'term-translation';
        translationDiv.textContent = term.target;

        termHeaderDiv.appendChild(sourceText);
        termHeaderDiv.appendChild(categoryText);
        termHeaderDiv.appendChild(translationDiv);

        const termMetaDiv = document.createElement('div');
        termMetaDiv.className = 'term-meta';

        const dateMetaDiv = document.createElement('div');
        dateMetaDiv.className = 'term-meta-item';
        dateMetaDiv.innerHTML = '<span class="term-meta-icon">📅</span><span>' + term.date + '</span>';

        const viewsMetaDiv = document.createElement('div');
        viewsMetaDiv.className = 'term-meta-item';
        viewsMetaDiv.innerHTML = '<span class="term-meta-icon">👁️</span><span>' + term.views + '</span>';

        termMetaDiv.appendChild(dateMetaDiv);
        termMetaDiv.appendChild(viewsMetaDiv);

        termItemDiv.appendChild(termHeaderDiv);
        termItemDiv.appendChild(termMetaDiv);

        cardDiv.appendChild(termItemDiv);
        termDiv.appendChild(cardDiv);

        return termDiv;
    }

    function displaySearchResults(results) {
        const searchResultsContainer = document.getElementById('searchResultsContainer');
        searchResultsContainer.innerHTML = '';

        if (results.length === 0) {
            searchResultsContainer.style.display = 'none';
            return;
        }

        searchResultsContainer.style.display = 'block';

        results.forEach(item => {
            const resultItem = document.createElement('div');
            resultItem.className = 'result-item';
            resultItem.innerHTML = `
                <span>${item.chinese}: ${item.english}</span>
                <span>(${item.category})</span>
            `;
            searchResultsContainer.appendChild(resultItem);
        });
    }

    function clearSearchResults() {
        const searchResultsContainer = document.getElementById('searchResultsContainer');
        searchResultsContainer.innerHTML = '';
        searchResultsContainer.style.display = 'none';
    }

    function showToast(message, loading = false) {
        // 创建toast元素
        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.textContent = message;

        if (loading) {
            toast.classList.add('loading');
        }

        // 添加到页面
        document.body.appendChild(toast);

        // 显示toast
        setTimeout(() => {
            toast.classList.add('show');
        }, 10);

        // 如果不是加载提示，3秒后移除
        if (!loading) {
            setTimeout(() => {
                toast.classList.remove('show');
                setTimeout(() => {
                    document.body.removeChild(toast);
                }, 300);
            }, 3000);
        }
    }
});
