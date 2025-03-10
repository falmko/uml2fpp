import { ui } from '@joint/plus';

/**
 * 选择管理器实例
 */
export let selection = null;

/**
 * 区域选择管理器实例
 */
let region = null;

/**
 * 获取当前选择管理器实例
 * @returns {ui.Selection} 选择管理器实例
 */
export function getSelection() {
    return selection;
}

/**
 * 创建并初始化新的选择管理器
 * @param {joint.dia.Paper} paper 画布实例
 */
export function NewSelection(paper) {
    // 初始化选择管理器
    selection = new ui.Selection({
        paper: paper,
    });

    // 初始化区域选择管理器
    region = new ui.RectangularSelectionRegion({ paper });

    // 设置元素选择事件处理
    setupElementSelection(paper);

    // 统一处理空白区域点击事件
    setupBlankAreaHandling(paper);
}

/**
 * 设置元素选择相关的事件处理
 * @param {joint.dia.Paper} paper 画布实例
 */
function setupElementSelection(paper) {
    // 当点击元素时处理选择逻辑
    paper.on('element:pointerup', (cellView, evt) => {
        if (evt.ctrlKey || evt.metaKey) {
            // 如果按住 CTRL/Meta 键，添加到现有选择
            selection.collection.add(cellView.model);
        } else {
            // 如果没有按住 CTRL/Meta 键，清除现有选择并选中当前元素
            selection.collection.reset([cellView.model]);
        }
    });

    // 当点击已选中元素时，如果按住 CTRL/Meta 键则取消选择
    selection.on('selection-box:pointerdown', (elementView, evt) => {
        if (evt.ctrlKey || evt.metaKey) {
            // 修复 this.selection 引用错误
            selection.collection.remove(elementView.model);
        }
    });
}

/**
 * 设置空白区域点击处理
 * @param {joint.dia.Paper} paper 画布实例
 */
function setupBlankAreaHandling(paper) {
    paper.on('blank:pointerdown', async (evt) => {
        // 当按住 Shift 键时使用区域选择
        if (evt.shiftKey) {
            const area = await region.getUserSelectionAsync();
            if (!area) return;

            // 选择区域内的所有元素
            const elementsInArea = paper.model.getElements().filter(element => {
                const elementBBox = element.getBBox();
                return area.containsRect(elementBBox);
            });

            // 根据是否按住 CTRL/Meta 键决定是添加到已有选择还是创建新选择
            if (evt.ctrlKey || evt.metaKey) {
                selection.collection.add(elementsInArea);
            } else {
                selection.collection.reset(elementsInArea);
            }
        } else {
            // 使用默认的拖拽选择
            selection.startSelecting(evt);
        }
    });
}
