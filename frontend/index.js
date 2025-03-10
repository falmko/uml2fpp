import { dia, shapes } from '@joint/plus';

import './styles/joint-plus.css';
import './styles/styles.css';
import { UMLClass } from './shapes/shapes'
import { Telemetry } from './shapes/telemetry';
import { Events } from './shapes/events';
import { Composition } from './shapes/link';
import { ComponentBase } from './shapes/compoent_base';
import { Parameters } from './shapes/parameters';
import { Commands } from './shapes/commands';
import { newInspector } from './inspectors/inspectors';
import { InputPort, OutputPort } from './shapes/port';
import { NewStencil } from './stencil/stencil';
import { NewSelection } from './selection/selection';
import { NewHalo } from './halo/halo';
import { NewKeyboard } from './keyboard/keyboard';
import { NewToolbar } from './toolbar/toolbar';
import { NewPortMoveTool } from './port_move_tool/port_move_tool';
import { NewCommandManager } from './command_manager/command_manager';
import { NewPaperScroller } from './paper_scroller/paper_scroller';
import { CustomLink, customRouter, CustomValidateConnection } from './link/link';
import { subElements } from './subgraph/subgraph';
import { menuTreeManager, NewMenuTreeManager } from './menu_tree/menu_tree';

// 注册自定义组件到shapes对象
/**
 * 注册自定义图形到shapes对象
 * 该函数将自定义的UMLClass、Telemetry、Events、Composition、ComponentBase、Parameters、Commands、InputPort和OutputPort图形注册到shapes对象中
 */
function registerCustomShapes() {
    shapes.UMLClass = UMLClass;
    shapes.UMLClassView = shapes.standard.HeaderedRecordView;
    shapes.Telemetry = Telemetry;
    shapes.TelemetryView = shapes.standard.HeaderedRecordView;
    shapes.Events = Events;
    shapes.EventsView = shapes.standard.HeaderedRecordView;
    shapes.Composition = Composition;
    shapes.ComponentBase = ComponentBase;
    shapes.ComponentBaseView = shapes.standard.HeaderedRecordView;
    shapes.Parameters = Parameters;
    shapes.ParametersView = shapes.standard.HeaderedRecordView;
    shapes.Commands = Commands;
    shapes.CommandsView = shapes.standard.HeaderedRecordView;
    shapes.InputPort = InputPort;
    shapes.OutputPort = OutputPort;
}

// 纸张配置
/**
 * 纸张配置常量
 * 定义了图表的宽度、高度、网格大小、背景颜色、默认连接线、默认路由器、默认连接点等配置
 */
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

/**
 * 初始化图表及相关组件
 * @returns {Object} 图表相关对象
 */
function initializeGraph() {
    // 注册自定义图形
    registerCustomShapes();

    // 获取DOM元素
    const paperContainerEl = document.getElementById("paper");
    const stencilContainerEl = document.getElementById("stencil");
    const toolbarContainerEl = document.getElementById("toolbar");
    const inspectorContainer = document.getElementById('inspector');
    const menuTreeContainer = document.getElementById('component-tree');

    // 创建图表
    const graph = new dia.Graph({}, { cellNamespace: shapes });

    // 创建纸张
    const paper = new dia.Paper({
        model: graph,
        cellViewNamespace: shapes,
        ...PAPER_CONFIG
    });

    // 初始化组件
    const paperScroller = NewPaperScroller(paper, paperContainerEl);
    const commandManager = NewCommandManager(graph);

    // 初始化插件
    NewHalo(paper);
    NewSelection(paper);
    NewKeyboard(graph, paper);
    NewToolbar(paperScroller, commandManager, toolbarContainerEl);
    NewStencil(graph, paper, shapes, stencilContainerEl);
    NewPortMoveTool(paper);
    newInspector(paper, inspectorContainer);

    // 初始化菜单树
    NewMenuTreeManager(graph, paper, paperScroller, null, menuTreeContainer);

    return { graph, paper, paperScroller };
}

/**
 * 处理组件添加事件
 * @param {Object} cell 添加的组件
 */
function handleComponentAdd(cell) {
    if (!cell.attributes.classType) return;

    const classType = cell.attributes.classType;
    const id = cell.id;
    const name = cell.attributes.name || `${classType}_${id}`;

    // 更新菜单树 - 添加组件名称
    menuTreeManager.updateData(`${classType}.${classType}_${id}.name`, name);

    // 处理端口
    if (cell.attributes.ports) {
        const ports = cell.attributes.ports.items;
        if (ports.length > 0) {
            const portsData = ports.map(port => ({
                id: port.id,
                name: port.properties.name || port.properties.kind + "_" + port.id,
            }));

            menuTreeManager.updateData(`${classType}.${classType}_${id}.ports`, portsData);
        }
    }
}

/**
 * 处理组件改变事件
 * @param {Object} cell 改变的组件
 */
function handleComponentChange(cell) {
    if (!(cell instanceof shapes.ComponentBase)) return;

    const classType = cell.attributes.classType;
    const id = cell.id;

    // 处理名称变更
    if (cell.changed.name && cell.changed.name.length > 0) {
        menuTreeManager.updateData(`${classType}.${classType}_${id}.name`, cell.changed.name);
    }
    // 处理端口变更
    else if (cell.changed.ports) {
        const ports = cell.changed.ports.items;
        if (ports.length > 0) {
            const portsData = ports.map(port => ({
                id: port.id,
                name: port.properties.name || port.properties.kind + "_" + port.id,
            }));

            menuTreeManager.updateData(`${classType}.${classType}_${id}.ports`, portsData);
        } else {
            menuTreeManager.deleteData(`${classType}.${classType}_${id}.ports`);
        }
    }
}

/**
 * 处理组件删除事件
 * @param {Object} cell 删除的组件
 */
function handleComponentRemove(cell) {
    // 处理组件类删除
    if (cell.attributes.classType) {
        const classType = cell.attributes.classType;
        const id = cell.id;

        // 更新菜单树
        menuTreeManager.deleteData(`${classType}.${classType}_${id}`);

        // 处理组件类型特殊情况
        if (classType === "Component" && subElements.has(id)) {
            subElements.delete(id);
        }
    }
}

/**
 * 设置图表事件监听器
 * @param {Object} graph 图表对象
 */
function setupGraphListeners(graph) {
    graph.on('add', handleComponentAdd);
    graph.on('change', handleComponentChange);
    graph.on('remove', handleComponentRemove);
}

// 初始化应用
const { graph } = initializeGraph();

// 设置事件监听
setupGraphListeners(graph);
