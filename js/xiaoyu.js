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
    alert("评估需要接入ai，可能需要1-2分钟时间，请耐心等待")
    const originalText = document.getElementById('original-text').value.trim();
    const translatedText = document.getElementById('translated-text').value.trim();
    const direction = getCurrentDirection(); // 确保你有这个函数

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

        // 检查响应是否成功
        if (response.ok) {
            // 显示评估结果
            document.getElementById('evaluation-result').innerHTML =
                `<div style="line-height: 1.8; white-space: pre-line;">${data.evaluation}</div>`;

            // 【关键】解析分数并绘制图表
            const scores = parseScoresFromEvaluation(data.evaluation);
            drawBarChart(scores);
            drawPieChart(scores);
            drawRadarChart(scores);

        } else {
            // 如果响应不成功，抛出错误
            throw new Error(data.error || `评估失败 (状态码: ${response.status})`);
        }

    } catch (error) {
        console.error('评估错误:', error);
        alert('评估失败：' + error.message);

        // 失败时显示备用信息
        document.getElementById('evaluation-result').innerHTML =
            '<p class="placeholder-text">评估失败，请重试...</p>';

        // 清空图表区域，避免显示旧数据
        const barCtx = document.getElementById('barChart');
        const pieCtx = document.getElementById('pieChart');
        if (barCtx) barCtx.getContext('2d').clearRect(0, 0, barCtx.width, barCtx.height);
        if (pieCtx) pieCtx.getContext('2d').clearRect(0, 0, pieCtx.width, pieCtx.height);

    } finally {
        // 无论成功还是失败，最后都隐藏加载动画
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
// 辅助函数：从AI评估文本中解析分数
function parseScoresFromEvaluation(evaluationText) {
    const scores = {
        accuracy: 0,
        fluency: 0,
        completeness: 0,
        grammar: 0,
        style: 0,
        total: 0
    };

    // 使用正则表达式匹配每一项的分数
    const accuracyMatch = evaluationText.match(/准确性：(\d+)\/10/);
    const fluencyMatch = evaluationText.match(/流畅性：(\d+)\/10/);
    const completenessMatch = evaluationText.match(/完整性：(\d+)\/10/);
    const grammarMatch = evaluationText.match(/语法正确性：(\d+)\/10/);
    const styleMatch = evaluationText.match(/风格一致性：(\d+)\/10/);
    const totalMatch = evaluationText.match(/总分：(\d+)\/50/);

    if (accuracyMatch) scores.accuracy = parseInt(accuracyMatch[1]);
    if (fluencyMatch) scores.fluency = parseInt(fluencyMatch[1]);
    if (completenessMatch) scores.completeness = parseInt(completenessMatch[1]);
    if (grammarMatch) scores.grammar = parseInt(grammarMatch[1]);
    if (styleMatch) scores.style = parseInt(styleMatch[1]);
    if (totalMatch) scores.total = parseInt(totalMatch[1]);

    return scores;
}
// 绘制条形图
function drawBarChart(scores) {
    const ctx = document.getElementById('barChart').getContext('2d');

    // 如果图表已存在，先销毁它
    if (window.barChartInstance) {
        window.barChartInstance.destroy();
    }

    window.barChartInstance = new Chart(ctx, {
        type: 'bar', // 图表类型为条形图
        data: {
            labels: ['准确性', '流畅性', '完整性', '语法正确性', '风格一致性'],
            datasets: [{
                label: '分数',
                data: [scores.accuracy, scores.fluency, scores.completeness, scores.grammar, scores.style],
                backgroundColor: [
                    'rgba(102, 126, 234, 0.6)',
                    'rgba(118, 75, 162, 0.6)',
                    'rgba(237, 100, 166, 0.6)',
                    'rgba(255, 159, 64, 0.6)',
                    'rgba(75, 192, 192, 0.6)'
                ],
                borderColor: [
                    'rgba(102, 126, 234, 1)',
                    'rgba(118, 75, 162, 1)',
                    'rgba(237, 100, 166, 1)',
                    'rgba(255, 159, 64, 1)',
                    'rgba(75, 192, 192, 1)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true,
                    max: 10 // Y轴最大值为10
                }
            },
            plugins: {
                legend: {
                    display: false // 不显示图例
                }
            }
        }
    });
}

// 绘制饼图
function drawPieChart(scores) {
    const ctx = document.getElementById('pieChart').getContext('2d');

    // 如果图表已存在，先销毁它
    if (window.pieChartInstance) {
        window.pieChartInstance.destroy();
    }

    window.pieChartInstance = new Chart(ctx, {
        type: 'pie', // 图表类型为饼图
        data: {
            labels: ['准确性', '流畅性', '完整性', '语法正确性', '风格一致性'],
            datasets: [{
                label: '分数占比',
                data: [scores.accuracy, scores.fluency, scores.completeness, scores.grammar, scores.style],
                backgroundColor: [
                    'rgba(102, 126, 234, 0.8)',
                    'rgba(118, 75, 162, 0.8)',
                    'rgba(237, 100, 166, 0.8)',
                    'rgba(255, 159, 64, 0.8)',
                    'rgba(75, 192, 192, 0.8)'
                ],
                borderColor: '#fff',
                borderWidth: 2
            }]
        },
        options: {
            plugins: {
                legend: {
                    position: 'top', // 图例位置
                },
                title: {
                    display: true,
                    text: `总分: ${scores.total}/50`
                }
            }
        }
    });
}

// 绘制雷达图（五维图）
function drawRadarChart(scores) {
    const ctx = document.getElementById('radarChart').getContext('2d');

    // 如果图表已存在，先销毁它
    if (window.radarChartInstance) {
        window.radarChartInstance.destroy();
    }

    window.radarChartInstance = new Chart(ctx, {
        type: 'radar', // 图表类型为雷达图
        data: {
            labels: ['准确性', '流畅性', '完整性', '语法正确性', '风格一致性'],
            datasets: [{
                label: '翻译能力',
                data: [scores.accuracy, scores.fluency, scores.completeness, scores.grammar, scores.style],
                backgroundColor: 'rgba(102, 126, 234, 0.2)', // 填充颜色
                borderColor: 'rgba(102, 126, 234, 1)',       // 边框颜色
                pointBackgroundColor: 'rgba(102, 126, 234, 1)', // 数据点颜色
                pointBorderColor: '#fff',                     // 数据点边框颜色
                pointHoverBackgroundColor: '#fff',            // 鼠标悬停时数据点颜色
                pointHoverBorderColor: 'rgba(102, 126, 234, 1)' // 鼠标悬停时数据点边框颜色
            }]
        },
        options: {
            responsive: false, // 不响应式，手动控制尺寸
            maintainAspectRatio: true, // 保持宽高比
            scales: {
                r: {
                    angleLines: {
                        display: true
                    },
                    suggestedMin: 0,    // 建议最小值
                    suggestedMax: 10,   // 建议最大值
                    ticks: {
                        stepSize: 2     // 刻度步长为2
                    }
                }
            },
            plugins: {
                legend: {
                    display: false // 不显示图例
                }
            }
        }
    });
}

