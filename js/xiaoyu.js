// 监听翻译方向变化
document.addEventListener('DOMContentLoaded', function() {
    const directionRadios = document.querySelectorAll('input[name="direction"]');
    directionRadios.forEach(radio => {
        radio.addEventListener('change', updateLabels);
    });
    updateLabels(); // 初始化标签
});

// 更新输入框标签和占位符
function updateLabels() {
    const direction = document.querySelector('input[name="direction"]:checked').value;
    const originalLabel = document.getElementById('original-label');
    const translatedLabel = document.getElementById('translated-label');
    const originalText = document.getElementById('original-text');
    const translatedText = document.getElementById('translated-text');

    if (direction === 'zh-to-en') {
        originalLabel.textContent = '中文原文';
        translatedLabel.textContent = '英文译文';
        originalText.placeholder = '请输入需要翻译的中文原文...';
        translatedText.placeholder = '请输入对应的英文译文...';
    } else {
        originalLabel.textContent = '英文原文';
        translatedLabel.textContent = '中文译文';
        originalText.placeholder = '请输入需要翻译的英文原文...';
        translatedText.placeholder = '请输入对应的中文译文...';
    }
}

function showLoading() {
    document.getElementById('loading').classList.add('show');
}

function hideLoading() {
    document.getElementById('loading').classList.remove('show');
}

// 获取当前翻译方向
function getCurrentDirection() {
    return document.querySelector('input[name="direction"]:checked').value;
}

// 生成参考译文
async function generateReference() {
    const originalText = document.getElementById('original-text').value.trim();
    const direction = getCurrentDirection();

    if (!originalText) {
        alert('请先输入原文！');
        return;
    }
    console.log('发送数据：',{
        text: originalText,
        direction:direction
    })
    showLoading();

    try {
        const response = await fetch('http://127.0.0.1:5000/api/generate-reference', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                text: originalText,
                direction: direction
            })
        });

        const data = await response.json();

        if (response.ok) {
            document.getElementById('reference-result').innerHTML =
                `<p><strong>参考译文：</strong></p><p>${data.reference_translation}</p>`;
        } else {
            throw new Error(data.error || '生成参考译文失败');
        }
    } catch (error) {
        alert('生成参考译文失败：' + error.message);
        document.getElementById('reference-result').innerHTML =
            '<p class="placeholder-text">生成失败，请重试...</p>';
    } finally {
        hideLoading();
    }
}

// 评估翻译
async function evaluateTranslation() {
    const originalText = document.getElementById('original-text').value.trim();
    const translatedText = document.getElementById('translated-text').value.trim();
    const direction = getCurrentDirection();

    if (!originalText || !translatedText) {
        alert('请输入原文和译文！');
        return;
    }

    showLoading();

    try {
        const response = await fetch('http://127.0.0.1:5000/api/evaluate-translation', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                original_text: originalText,
                translated_text: translatedText,
                direction: direction
            })
        });

        const data = await response.json();

        if (response.ok) {
            // 显示评估结果
            document.getElementById('evaluation-result').innerHTML =
                `<div style="line-height: 1.8;">${data.evaluation}</div>`;

            // 这里可以添加图表生成逻辑
            document.getElementById('chart-result').innerHTML =
                '<p>评分图表功能待实现...</p>';
        } else {
            throw new Error(data.error || '评估失败');
        }
    } catch (error) {
        alert('评估失败：' + error.message);
        document.getElementById('evaluation-result').innerHTML =
            '<p class="placeholder-text">评估失败，请重试...</p>';
    } finally {
        hideLoading();
    }
}

// 清空所有内容
function clearAll() {
    document.getElementById('original-text').value = '';
    document.getElementById('translated-text').value = '';
    document.getElementById('reference-result').innerHTML = '<p class="placeholder-text">参考译文将在这里显示...</p>';
    document.getElementById('evaluation-result').innerHTML = '<p class="placeholder-text">AI评估结果将在这里显示...</p>';
    document.getElementById('chart-result').innerHTML = '<p class="placeholder-text">评分图表将在这里显示...</p>';
}
