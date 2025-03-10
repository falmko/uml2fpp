import { shapes } from '@joint/plus';

/**
 * 创建并返回自定义的连线对象
 * @param {Object} cellView - JointJS cellView实例
 * @param {HTMLElement} magnet - 连接点的DOM元素
 * @returns {shapes.standard.Link|shapes.Composition} 自定义的连线对象
 */
export function CustomLink(cellView, magnet) {
    // 检查连接是否来自端口
    if (magnet) {
        // 确认是端口连接 - 检查magnet属性
        const isPort = magnet.hasAttribute('port');

        if (isPort) {
            // 端口连接使用普通连线
            return new shapes.standard.Link();
        }
    }

    // 组件与事件/遥测等之间的连接使用组合线
    return new shapes.Composition({
        attrs: {
            line: {
                stroke: '#5755a1',
                strokeWidth: 2
            }
        }
    });
}

/**
 * 验证连接的有效性
 * @param {Object} sourceView - 源cellView实例
 * @param {HTMLElement} sourceMagnet - 源连接点的DOM元素
 * @param {Object} targetView - 目标cellView实例
 * @param {HTMLElement} targetMagnet - 目标连接点的DOM元素
 * @returns {boolean} 连接是否有效
 */
export function CustomValidateConnection(sourceView, sourceMagnet, targetView, targetMagnet) {
    // 不允许自连接
    if (sourceView === targetView) {
        return false;
    }

    const sourceModel = sourceView.model;
    const targetModel = targetView.model;

    // 如果源或目标是端口
    if (sourceMagnet || targetMagnet) {
        // 只有当两端都是端口，且都是 ComponentBase 的端口时才允许连接
        return (sourceMagnet && targetMagnet &&
            sourceModel instanceof shapes.ComponentBase &&
            targetModel instanceof shapes.ComponentBase);
    }

    // 如果源是 ComponentBase（且不是端口连接）
    if (sourceModel instanceof shapes.ComponentBase) {
        // 目标必须是Log或Telemetry，且不能是端口连接
        return (targetModel instanceof shapes.Events ||
            targetModel instanceof shapes.Telemetry ||
            targetModel instanceof shapes.Parameters ||
            targetModel instanceof shapes.Commands) &&
            !targetMagnet;  // 确保目标不是端口
    }

    // 如果源是Log或Telemetry，不允许作为连接的起点
    if (sourceModel instanceof shapes.Events ||
        sourceModel instanceof shapes.Telemetry ||
        targetModel instanceof shapes.Parameters ||
        targetModel instanceof shapes.Commands) {
        return false;
    }

    return true;
}

/**
 * 自定义路由器配置
 * 定义了连线的路由方式和参数
 */
export const customRouter = {
    name: 'orthogonal',
    args: {
        padding: 40,
        excludeTypes: ['link'],
        directions: ['left', 'right', 'top', 'bottom'],
        cost: 'manhattan'
    }
}
