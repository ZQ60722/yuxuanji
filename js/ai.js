window.onload = function () {
    // 模态框内容数据
    const modalContent = {
        'one': {
            title: '写作灵感',
            content: `
            <h2>写作灵感</h2>
            <p>这里是一些写作灵感的详细内容：</p>
            <ul>
                <li>观察日常生活中的小细节</li>
                <li>阅读不同类型的书籍和文章</li>
                <li>尝试自由写作，不设限制</li>
                <li>与他人交流，获取新观点</li>
                <li>旅行或探索新环境</li>
            </ul>
            <p>通过这些方法，你可以不断激发自己的创作灵感，写出更加生动有趣的内容。</p>
        `
        },
        'two': {
            title: '设计思路',
            content: `
            <h2>设计思路</h2>
            <p>UI/UX设计参考和思路：</p>
            <ul>
                <li>用户研究：了解目标用户的需求和行为</li>
                <li>信息架构：合理组织和布局内容</li>
                <li>视觉层次：通过大小、颜色和对比度引导用户注意力</li>
                <li>一致性：保持设计元素的一致性</li>
                <li>可访问性：确保所有用户都能使用你的设计</li>
            </ul>
            <p>好的设计不仅要美观，更要实用和易用。</p>
        `
        },
        'three': {
            title: '营销策略',
            content: `
            <h2>营销策略</h2>
            <p>有效的推广活动建议：</p>
            <ul>
                <li>明确目标受众和营销目标</li>
                <li>选择合适的营销渠道</li>
                <li>创造有吸引力的内容</li>
                <li>利用社交媒体扩大影响力</li>
                <li>分析数据并优化策略</li>
            </ul>
            <p>成功的营销策略需要不断测试和调整，以适应市场变化。</p>
        `
        },
        'four': {
            title: '创意技巧',
            content: `
            <h2>创意技巧</h2>
            <p>提高创造力的方法：</p>
            <ul>
                <li>头脑风暴：不受限制地产生想法</li>
                <li>思维导图：可视化思考过程</li>
                <li>六顶思考帽：从不同角度思考问题</li>
                <li>SCAMPER技术：通过替代、组合等方式创新</li>
                <li>跨界思考：将不同领域的知识结合起来</li>
            </ul>
            <p>创造力是可以培养的，通过练习这些技巧，你可以提高自己的创新能力。</p>
        `
        }
    };

    // 获取模态框元素
    const modal = document.getElementById('modal');
    const modalBody = document.getElementById('modal-body');
    const closeButton = document.querySelector('.close-button');

    // 为所有li元素添加点击事件
    document.querySelectorAll('#leftSidebar li').forEach(li => {
        li.addEventListener('click', function() {
            const id = this.id;
            if (modalContent[id]) {
                modalBody.innerHTML = modalContent[id].content;
                modal.style.display = 'flex';
            }
        });
    });

    // 关闭模态框
    closeButton.addEventListener('click', function() {
        modal.style.display = 'none';
    });

    // 点击模态框外部关闭模态框
    window.addEventListener('click', function(event) {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });

}