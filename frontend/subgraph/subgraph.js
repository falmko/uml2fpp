import { dia, shapes } from '@joint/plus';
import { NewInspector } from '../inspectors/inspectors';
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

export var subElements = new Map();

// 子画布 弹出窗口中使用
export const subGraph = new dia.Graph({}, { cellNamespace: shapes });
const subPaperContainerEl = document.getElementById("modal-body");
const subToolbarContainerEl = document.getElementById("sub-toolbar");
const subInspectorContainer = document.getElementById('sub-inspector');

// Paper
// -----
export const subPaper = new dia.Paper({
    model: subGraph,
    cellViewNamespace: shapes,
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
});
const subPaperScroller = NewPaperScroller(subPaper, subPaperContainerEl);
const subCommandManager = NewCommandManager(subGraph);

NewSubHalo(subPaper);
NewSubToolbar(subPaperScroller, subCommandManager, subToolbarContainerEl);
NewInspector(subPaper, subInspectorContainer);


// 监听graph的add、remove、change事件，更新menu_tree和subElements
const componentTypes = ['Events', 'Telemetry', 'Parameters', 'Commands'];
subGraph.on('add', function (cell) {

    // 处理子组件添加
    if (componentTypes.includes(cell.attributes.classType)) {
        const id = cell.id;
        const parentId = cell.attributes.parent_id;
        const name = cell.attributes.className || cell.attributes.classType + "_" + id;

        // 更新menuTreeManager - 添加子组件
        if (parentId) {
            menuTreeManager.updateData(`Component.Component_${parentId}.${cell.attributes.classType}.${id}.name`, name);
        }
    }
});

subGraph.on('change', function (cell) {

    // 处理子组件属性变更
    if (componentTypes.includes(cell.attributes.classType) && cell.changed.className) {
        const id = cell.id;
        const parentId = cell.attributes.parent_id;
        const name = cell.changed.className;

        // 更新menuTreeManager - 更新子组件名称
        if (parentId) {
            menuTreeManager.updateData(`Component.Component_${parentId}.${cell.attributes.classType}.${id}.name`, name);
        }
    }
});

// 修改remove监听，单独处理链接和组件的删除
subGraph.on('remove', function (cell) {
    // 处理连接删除
    if (cell.attributes.type == "Composition") {
        const sourceId = cell.attributes.source.id;
        const cid = cell.cid;

        if (subElements.has(sourceId)) {
            let targetObj = subElements.get(sourceId);
            // 从links数组中删除对应的链接
            if (targetObj.Links && Array.isArray(targetObj.Links)) {
                const linkIndex = targetObj.Links.findIndex(link => link.cid === cid);

                if (linkIndex !== -1) {
                    targetObj.Links.splice(linkIndex, 1);
                    subElements.set(sourceId, targetObj);
                }
            }
        }
    }
    // 处理子组件删除
    else {
        if (componentTypes.includes(cell.attributes.classType)) {
            const id = cell.id;
            const parentId = cell.attributes.parent_id;

            if (parentId && subElements.has(parentId)) {
                let targetObj = subElements.get(parentId);

                // 找到并删除对应的组件
                if (targetObj[cell.attributes.classType] && targetObj[cell.attributes.classType].id === id) {
                    delete targetObj[cell.attributes.classType];
                    subElements.set(parentId, targetObj);

                    // 更新menuTreeManager - 删除子组件
                    menuTreeManager.deleteData(`Component.Component_${parentId}.${cell.attributes.classType}.${id}`);
                }
            }
        }
    }
});

// 定义要创建的子元素类型
export const elementTypes = ['Events', 'Telemetry', 'Parameters', 'Commands'];

// 定义子元素位置
const positions = {
    'Events': { x: 100, y: 100 },
    'Telemetry': { x: 100, y: 300 },
    'Parameters': { x: 420, y: 100 },
    'Commands': { x: 420, y: 300 }
};

// 确定类和数据属性名称
const classMapping = {
    'Events': { class: Events, dataKey: 'events', dataField: 'events' },
    'Telemetry': { class: Telemetry, dataKey: 'Telemetry', dataField: 'channels', extraField: 'telemetry_base' },
    'Parameters': { class: Parameters, dataKey: 'Parameters', dataField: 'parameters' },
    'Commands': { class: Commands, dataKey: 'Commands', dataField: 'commands' }
};

// 提取创建子元素和连接的函数
export function createSubElement(componentData, elementType, componentId) {


    const mapping = classMapping[elementType];
    if (!mapping) return null;

    // 准备创建实例的配置
    const config = {
        type: elementType,
        size: { width: 300 },
        name: elementType,
        className: `${elementType}Class`,
        classType: elementType,
        position: elementType?positions[elementType]:{ x: 100, y: 100 },
        parent_id: componentId
    };

    // 添加特定属性
    if (mapping.extraField && componentData[mapping.dataKey][mapping.extraField] !== undefined) {
        config[mapping.extraField] = componentData[mapping.dataKey][mapping.extraField];
    }

    // 添加主数据数组
    if (componentData[mapping.dataKey] && componentData[mapping.dataKey][mapping.dataField]) {
        config[mapping.dataField] = componentData[mapping.dataKey][mapping.dataField] || [];
    }

    // 创建实例
    const element = new mapping.class(config);

    // 创建连接
    const link = new shapes.Composition({
        source: { id: componentId },
        target: { id: element.id }
    });

    return { element, link };
}