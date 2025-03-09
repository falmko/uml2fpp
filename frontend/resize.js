document.addEventListener('DOMContentLoaded', function () {
    // 配置常量
    const MIN_WIDTH = 100;
    const MAX_WIDTH_PERCENT = 0.5;
    const MIN_HEIGHT = 100;
    const MIN_RIGHT_PERCENT = 5;
    const MAX_RIGHT_PERCENT = 30;
    const MIN_SUB_RIGHT_PERCENT = 5;
    const MAX_SUB_RIGHT_PERCENT = 40;
    const DEFAULT_WIDTH = '99%';
    const SPLITTER_GAP = 5;

    // 获取元素引用
    const elements = {
        stencil: document.getElementById('stencil'),
        sidebar: document.getElementById('sidebar'),
        paper: document.getElementById('paper'),
        inspector: document.getElementById('inspector'),
        verticalSplitter: document.getElementById('vertical-splitter'),
        horizontalSplitter: document.getElementById('horizontal-splitter'),
        inspectorSplitter: document.getElementById('inspector-splitter'),
        modalBody: document.getElementById('modal-body'),
        subInspector: document.getElementById('sub-inspector'),
        subInspectorSplitter: document.getElementById('sub-inspector-splitter'),
        modalContent: document.getElementById('modal-content')
    };

    // 通用的鼠标事件处理函数
    function setupSplitterEvents(config) {
        const { splitter, onMove, onEnd } = config;

        splitter.addEventListener('mousedown', function (e) {
            e.preventDefault();

            // 设置初始状态
            const initialState = {
                startX: e.clientX,
                startY: e.clientY
            };

            // 鼠标移动事件处理
            function handleMouseMove(e) {
                onMove(e, initialState);
            }

            // 鼠标抬起事件处理
            function handleMouseUp() {
                document.removeEventListener('mousemove', handleMouseMove);
                document.removeEventListener('mouseup', handleMouseUp);
                if (onEnd) onEnd();
            }

            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
        });
    }

    // 设置左侧垂直分隔条（stencil/sidebar与paper之间）
    setupSplitterEvents({
        splitter: elements.verticalSplitter,
        onMove: function (e, initialState) {
            const { stencil, sidebar, verticalSplitter, horizontalSplitter, paper } = elements;
            const containerWidth = window.innerWidth;
            const newX = e.clientX;
            const newWidthPercent = (newX / containerWidth) * 100;

            if (newX > MIN_WIDTH && newX < containerWidth * MAX_WIDTH_PERCENT) {
                const newWidth = newX + 'px';
                // 更新stencil和sidebar的宽度
                stencil.style.width = newWidth;
                sidebar.style.width = (newX - SPLITTER_GAP) + 'px';

                // 更新分隔条位置
                verticalSplitter.style.left = newWidth;
                horizontalSplitter.style.width = newWidth;

                // 更新paper左边界
                paper.style.left = (newX + SPLITTER_GAP) + 'px';
            }
        }
    });

    // 设置水平分隔条（stencil与sidebar之间）
    setupSplitterEvents({
        splitter: elements.horizontalSplitter,
        onMove: function (e, initialState) {
            const { stencil, horizontalSplitter, sidebar } = elements;
            const containerHeight = window.innerHeight;
            const newY = e.clientY;

            if (newY > MIN_HEIGHT && newY < containerHeight - MIN_HEIGHT) {
                const newHeight = newY + 'px';

                // 更新stencil高度
                stencil.style.height = newHeight;

                // 更新分隔条位置
                horizontalSplitter.style.top = newHeight;

                // 更新sidebar位置和高度
                sidebar.style.top = (newY + SPLITTER_GAP) + 'px';
            }
        }
    });

    // 设置右侧分隔条（paper与inspector之间）
    setupSplitterEvents({
        splitter: elements.inspectorSplitter,
        onMove: function (e, initialState) {
            const { inspector, inspectorSplitter, paper } = elements;
            const containerWidth = window.innerWidth;
            const newX = e.clientX;
            const newRight = (containerWidth - newX) / containerWidth * 100;

            if (newRight > MIN_RIGHT_PERCENT && newRight < MAX_RIGHT_PERCENT) {
                // 更新inspector宽度和分隔条位置
                inspector.style.width = newRight + '%';
                inspectorSplitter.style.right = newRight + '%';

                // 更新paper右边界
                paper.style.right = newRight + '%';
            }
        }
    });

    // 更新paper宽度函数
    function updatePaperWidth() {
        const { paper, inspector, inspectorSplitter } = elements;
        const inspectorStyle = window.getComputedStyle(inspector);

        if (inspectorStyle.display === 'none') {
            paper.style.right = '0';
            inspectorSplitter.style.display = 'none';
        } else {
            paper.style.right = inspectorStyle.width;
            inspectorSplitter.style.display = 'block';
        }
    }

    // 监听inspector显示状态变化
    const observeInspector = new MutationObserver(function (mutations) {
        // 使用一次更新，无需遍历每个mutation
        updatePaperWidth();
    });

    observeInspector.observe(elements.inspector, {
        attributes: true,
        attributeFilter: ['style']
    });

    // 初始执行一次
    updatePaperWidth();

    // 设置模态框中的分隔条（modal-body与sub-inspector之间）
    setupSplitterEvents({
        splitter: elements.subInspectorSplitter,
        onMove: function (e, initialState) {
            const { subInspector, subInspectorSplitter, modalBody, modalContent } = elements;
            const containerWidth = modalContent.offsetWidth;
            const newX = e.clientX;
            const modalLeft = modalContent.getBoundingClientRect().left;
            const newRight = (containerWidth - newX + modalLeft) / containerWidth * 100;

            if (newRight > MIN_SUB_RIGHT_PERCENT && newRight < MAX_SUB_RIGHT_PERCENT) {
                // 更新sub-inspector宽度和分隔条位置
                subInspector.style.width = newRight + '%';
                subInspectorSplitter.style.right = newRight + '%';

                // 更新modal-body宽度
                modalBody.style.width = (99 - newRight) + '%';
            }
        }
    });

    // 更新modal-body宽度函数
    function updateModalBodyWidth() {
        const { modalBody, subInspector, subInspectorSplitter, modalContent } = elements;
        const subInspectorStyle = window.getComputedStyle(subInspector);

        if (subInspectorStyle.display === 'none') {
            modalBody.style.width = DEFAULT_WIDTH;
            subInspectorSplitter.style.display = 'none';
        } else {
            // 计算宽度百分比
            const subInspectorWidth = parseFloat(subInspectorStyle.width) /
                parseFloat(window.getComputedStyle(modalContent).width) * 100;

            modalBody.style.width = (99 - subInspectorWidth) + '%';
            subInspectorSplitter.style.display = 'block';
        }
    }

    // 监听sub-inspector显示状态变化
    const observeSubInspector = new MutationObserver(function () {
        // 直接触发一次更新
        updateModalBodyWidth();
    });

    observeSubInspector.observe(elements.subInspector, {
        attributes: true,
        attributeFilter: ['style']
    });

    // 初始执行一次
    updateModalBodyWidth();
});