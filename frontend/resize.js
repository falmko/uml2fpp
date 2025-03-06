document.addEventListener('DOMContentLoaded', function() {
    // 获取元素引用
    const stencil = document.getElementById('stencil');
    const sidebar = document.getElementById('sidebar');
    const paper = document.getElementById('paper');
    const inspector = document.getElementById('inspector');
    
    // 获取分隔条
    const verticalSplitter = document.getElementById('vertical-splitter');
    const horizontalSplitter = document.getElementById('horizontal-splitter');
    const inspectorSplitter = document.getElementById('inspector-splitter');
    
    // 左侧垂直分隔条（stencil/sidebar与paper之间）
    verticalSplitter.addEventListener('mousedown', function(e) {
        e.preventDefault();
        const startX = e.clientX;
        const startWidth = stencil.offsetWidth;
        
        function onMouseMove(e) {
            const newWidth = startWidth + e.clientX - startX;
            if (newWidth > 100 && newWidth < window.innerWidth * 0.5) {
                // 更新stencil和sidebar的宽度
                stencil.style.width = newWidth + 'px';
                sidebar.style.width = (newWidth - 5) + 'px';
                
                // 更新分隔条位置
                verticalSplitter.style.left = newWidth + 'px';
                horizontalSplitter.style.width = newWidth + 'px';
                
                // 更新paper左边界
                paper.style.left = (newWidth + 5) + 'px';
            }
        }
        
        function onMouseUp() {
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
        }
        
        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
    });
    
    // 水平分隔条（stencil与sidebar之间）
    horizontalSplitter.addEventListener('mousedown', function(e) {
        e.preventDefault();
        const startY = e.clientY;
        const startHeight = stencil.offsetHeight;
        
        function onMouseMove(e) {
            const newHeight = startHeight + e.clientY - startY;
            if (newHeight > 100 && newHeight < window.innerHeight - 100) {
                // 更新stencil高度
                stencil.style.height = newHeight + 'px';
                
                // 更新分隔条位置
                horizontalSplitter.style.top = newHeight + 'px';
                
                // 更新sidebar位置和高度
                sidebar.style.top = (newHeight + 5) + 'px';
            }
        }
        
        function onMouseUp() {
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
        }
        
        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
    });
    
    // 右侧分隔条（paper与inspector之间）
    inspectorSplitter.addEventListener('mousedown', function(e) {
        e.preventDefault();
        const startX = e.clientX;
        const containerWidth = window.innerWidth;
        const startRight = (containerWidth - startX);
        
        function onMouseMove(e) {
            const newX = e.clientX;
            const newRight = (containerWidth - newX) / containerWidth * 100;
            
            if (newRight > 5 && newRight < 30) {
                // 更新inspector宽度和分隔条位置
                inspector.style.width = newRight + '%';
                inspectorSplitter.style.right = newRight + '%';
                
                // 更新paper右边界
                paper.style.right = newRight + '%';
            }
        }
        
        function onMouseUp() {
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
        }
        
        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
    });
    
    // 监听inspector显示状态变化
    const observeInspector = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.type === 'style' || mutation.attributeName === 'style') {
                updatePaperWidth();
            }
        });
    });
    
    observeInspector.observe(inspector, { attributes: true });
    
    // 更新paper宽度函数
    function updatePaperWidth() {
        if (window.getComputedStyle(inspector).display === 'none') {
            paper.style.right = '0';
            inspectorSplitter.style.display = 'none';
        } else {
            paper.style.right = window.getComputedStyle(inspector).width;
            inspectorSplitter.style.display = 'block';
        }
    }
    
    // 初始执行一次
    updatePaperWidth();
});