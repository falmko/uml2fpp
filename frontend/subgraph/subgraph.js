import { dia, shapes } from '@joint/plus';
import { newInspector } from '../inspectors/inspectors';
import { NewSubHalo } from '../halo/halo';
import { NewSubToolbar } from '../toolbar/toolbar';
import { NewCommandManager } from '../command_manager/command_manager';
import { NewPaperScroller } from '../paper_scroller/paper_scroller';
import { CustomLink, customRouter, CustomValidateConnection } from '../link/link';
import { menuTreeManager } from '../menu_tree/menu_tree';
import { Events } from '../shapes/events';
import { Telemetry } from '../shapes/telemetry';
import { Parameters } from '../shapes/parameters';
import { Commands } from '../shapes/commands';

// 常量定义
const COMPONENT_TYPES = ['Events', 'Telemetry', 'Parameters', 'Commands'];
const PAPER_CONFIG = {
    width: 2560,
    height: 1440,
    gridSize: 20,
    drawGrid: { name: "mesh" },
    async: true,
    sorting: dia.Paper.sorting.APPROX,
    background: { color: "#F3F7F6" },
    defaultLink: CustomLink,
    defaultRouter: customRouter,
    defaultConnector: { name: 'rounded', args: { cornerType: 'line' } },
    defaultConnectionPoint: { name: "boundary" },
    clickThreshold: 10,
    magnetThreshold: "onleave",
    linkPinning: false,
    validateConnection: CustomValidateConnection,
    snapLinks: { radius: 10 }
};

// 元素位置配置
const ELEMENT_POSITIONS = {
    'Events': { x: 100, y: 100 },
    'Telemetry': { x: 100, y: 300 },
    'Parameters': { x: 420, y: 100 },
    'Commands': { x: 420, y: 300 }
};

// 类与数据字段映射
const CLASS_MAPPING = {
    'Events': { class: Events, dataKey: 'events', dataField: 'events' },
    'Telemetry': { class: Telemetry, dataKey: 'Telemetry', dataField: 'channels', extraField: 'telemetry_base' },
    'Parameters': { class: Parameters, dataKey: 'Parameters', dataField: 'parameters' },
    'Commands': { class: Commands, dataKey: 'Commands', dataField: 'commands' }
};

/**
 * 存储组件状态
 * 使用Map对象存储组件的子元素和连接信息
 */
export const subElements = new Map();

/**
 * 子画布初始化
 * 创建并返回一个新的JointJS图表实例
 */
export const subGraph = new dia.Graph({}, { cellNamespace: shapes });

// DOM 元素引用
const subPaperContainerEl = document.getElementById("modal-body");
const subToolbarContainerEl = document.getElementById("sub-toolbar");
const subInspectorContainer = document.getElementById('sub-inspector');

/**
 * 初始化子画布及相关组件
 * @returns {Object} 包含子画布实例的对象
 */
function initializeSubPaper() {
    // 创建画布
    const paper = new dia.Paper({
        model: subGraph,
        cellViewNamespace: shapes,
        ...PAPER_CONFIG
    });

    // 初始化相关组件
    const paperScroller = NewPaperScroller(paper, subPaperContainerEl);
    const commandManager = NewCommandManager(subGraph);

    NewSubHalo(paper);
    NewSubToolbar(paperScroller, commandManager, subToolbarContainerEl);
    newInspector(paper, subInspectorContainer);

    return { paper };
}

// 初始化子画布
export const { paper: subPaper } = initializeSubPaper();

/**
 * 处理组件添加事件
 * @param {Object} cell 添加的单元格
 */
function handleComponentAdd(cell) {
    if (!COMPONENT_TYPES.includes(cell.attributes.classType)) return;

    const id = cell.id;
    const parentId = cell.attributes.parent_id;
    const name = cell.attributes.className || `${cell.attributes.classType}_${id}`;

    if (parentId) {
        // 更新菜单树 - 添加子组件
        menuTreeManager.updateData(
            `Component.Component_${parentId}.${cell.attributes.classType}.${id}.name`,
            name
        );
    }
}

/**
 * 处理组件变更事件
 * @param {Object} cell 变更的单元格
 */
function handleComponentChange(cell) {
    if (!COMPONENT_TYPES.includes(cell.attributes.classType) || !cell.changed.className) return;

    const id = cell.id;
    const parentId = cell.attributes.parent_id;
    const name = cell.changed.className;

    if (parentId) {
        // 更新菜单树 - 更新子组件名称
        menuTreeManager.updateData(
            `Component.Component_${parentId}.${cell.attributes.classType}.${id}.name`,
            name
        );
    }
}

/**
 * 处理链接删除事件
 * @param {Object} cell 被删除的链接
 */
function handleLinkRemove(cell) {
    const sourceId = cell.attributes.source.id;
    const cid = cell.cid;

    if (!subElements.has(sourceId)) return;

    const targetObj = subElements.get(sourceId);

    // 从links数组中删除对应的链接
    if (targetObj.Links && Array.isArray(targetObj.Links)) {
        const linkIndex = targetObj.Links.findIndex(link => link.cid === cid);

        if (linkIndex !== -1) {
            targetObj.Links.splice(linkIndex, 1);
            subElements.set(sourceId, targetObj);
        }
    }
}

/**
 * 处理组件删除事件
 * @param {Object} cell 被删除的组件
 */
function handleComponentRemove(cell) {
    if (!COMPONENT_TYPES.includes(cell.attributes.classType)) return;

    const id = cell.id;
    const parentId = cell.attributes.parent_id;

    if (!parentId || !subElements.has(parentId)) return;

    const targetObj = subElements.get(parentId);

    // 找到并删除对应的组件
    if (targetObj[cell.attributes.classType] && targetObj[cell.attributes.classType].id === id) {
        delete targetObj[cell.attributes.classType];
        subElements.set(parentId, targetObj);

        // 更新菜单树 - 删除子组件
        menuTreeManager.deleteData(`Component.Component_${parentId}.${cell.attributes.classType}.${id}`);
    }
}

/**
 * 设置图表事件监听
 */
function setupGraphListeners() {
    subGraph.on('add', handleComponentAdd);
    subGraph.on('change', handleComponentChange);
    subGraph.on('remove', cell => {
        if (cell.attributes.type === "Composition") {
            handleLinkRemove(cell);
        } else {
            handleComponentRemove(cell);
        }
    });
}

// 初始化事件监听
setupGraphListeners();

// 导出可用的子元素类型
export const elementTypes = COMPONENT_TYPES;

/**
 * 创建子元素和连接
 * @param {Object} componentData 组件数据
 * @param {String} elementType 元素类型
 * @param {String} componentId 组件ID
 * @returns {Object|null} 创建的元素和连接
 */
export function createSubElement(componentData, elementType, componentId) {
    const mapping = CLASS_MAPPING[elementType];
    if (!mapping) return null;

    // 准备创建实例的配置
    const config = {
        type: elementType,
        size: { width: 300 },
        name: elementType,
        className: `${elementType}Class`,
        classType: elementType,
        position: elementType ? ELEMENT_POSITIONS[elementType] : { x: 100, y: 100 },
        parent_id: componentId
    };

    // 添加特定属性
    if (mapping.extraField && componentData[mapping.dataKey]?.[mapping.extraField] !== undefined) {
        config[mapping.extraField] = componentData[mapping.dataKey][mapping.extraField];
    }

    // 添加主数据数组
    if (componentData[mapping.dataKey]?.[mapping.dataField]) {
        config[mapping.dataField] = componentData[mapping.dataKey][mapping.dataField] || [];
    }

    // 创建实例和连接
    const element = new mapping.class(config);
    const link = new shapes.Composition({
        source: { id: componentId },
        target: { id: element.id }
    });

    return { element, link };
}
