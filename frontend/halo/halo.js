import { ui } from '@joint/plus';

/**
 * Halo配置常量
 */
const HALO_CONFIGS = {
    // 基础Halo - 移除clone和fork
    basic: ['clone', 'fork'],

    // 子组件Halo
    component: ['clone', 'fork', 'unlink', 'rotate', 'link', 'remove'],

    // 通用子组件Halo
    defaultSub: ['clone', 'fork', 'unlink', 'rotate', 'link']
};

/**
 * 初始化标准Halo功能
 * @param {Object} paper - JointJS paper实例
 */
export function NewHalo(paper) {
    paper.on('cell:pointerup', (cellView) => {
        createHalo(cellView, HALO_CONFIGS.basic);
    });
}

/**
 * 初始化子组件Halo功能
 * @param {Object} paper - JointJS paper实例
 */
export function NewSubHalo(paper) {
    paper.on('cell:pointerup', (cellView) => {
        openSubHalo(cellView);
    });
}

/**
 * 为指定单元格视图打开标准Halo
 * @param {Object} cellView - JointJS cellView实例
 */
export function openHalo(cellView) {
    createHalo(cellView, HALO_CONFIGS.basic);
}

/**
 * 为指定单元格视图打开子组件Halo
 * @param {Object} cellView - JointJS cellView实例
 */
function openSubHalo(cellView) {
    const isComponent = cellView.model.attributes.classType === "Component";
    const handleConfig = isComponent ? HALO_CONFIGS.component : HALO_CONFIGS.defaultSub;

    createHalo(cellView, handleConfig);
}

/**
 * 创建并渲染带有指定配置的Halo
 * @param {Object} cellView - JointJS cellView实例
 * @param {Array} handleToRemove - 要移除的句柄列表
 * @returns {Object} 创建的Halo实例
 */
function createHalo(cellView, handleToRemove) {
    const halo = new ui.Halo({
        cellView: cellView
    });

    // 移除指定的句柄
    handleToRemove.forEach(handle => {
        halo.removeHandle(handle);
    });

    // 渲染并返回Halo实例
    return halo.render();
}