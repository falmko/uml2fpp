import { dia, shapes, ui, format, util, highlighters, mvc, V, g } from '@joint/plus';

import './joint-plus.css';
import './styles.css';
import { UMLClass } from './shapes/shapes'
import { Telemetry } from './shapes/telemetry';
import { Events } from './shapes/events';
import { Composition } from './shapes/link';
import { ComponentBase } from './shapes/compoent_base';
import { Parameters } from './shapes/parameters';
import { Commands } from './shapes/commands';
import { createInspector, openTab } from './inspectors/inspectors';
import { componentKindOptions } from './shapes/compoent_base';
import { portKindOptions,passByOptions } from './shapes/port';
import { queueFullOptions } from './shapes/commands';
import { InputPort,OutputPort } from './shapes/port';

// const namespace = { ...shapes, myNamespace: { UMLClass } };
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

const graph = new dia.Graph({}, { cellNamespace: shapes });

const paperContainerEl = document.getElementById("paper");
const stencilContainerEl = document.getElementById("stencil");
const toolbarContainerEl = document.getElementById("toolbar");

// Paper
// -----
const paper = new dia.Paper({
    model: graph,
    cellViewNamespace: shapes,
    width: 2000,
    height: 1440,
    gridSize: 20,
    drawGrid: { name: "mesh" },
    async: true,
    sorting: dia.Paper.sorting.APPROX,
    background: { color: "#F3F7F6" },
    defaultLink: (cellView, magnet) => {
        console.log("Default link:", cellView, magnet);
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
    },
    defaultRouter: {
        name: 'orthogonal',
        args: {
            padding: 40,
            excludeTypes: ['link'],
            directions: ['left', 'right', 'top', 'bottom'],
            cost: 'manhattan'
        }
    },
    defaultConnector: { name: 'rounded', args: { cornerType: 'line' } },
    defaultConnectionPoint: { name: "boundary" },
    clickThreshold: 10,
    magnetThreshold: "onleave",
    linkPinning: false,
    validateConnection: (sourceView, sourceMagnet, targetView, targetMagnet) => {
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
    },
    snapLinks: { radius: 10 }
});
// paperContainerEl.appendChild(paper.el);
// 监听点击端口事件，添加端口工具
paper.on("element:magnet:pointerclick", (elementView, evt, magnet) => {
    evt.stopPropagation()
    console.log("Magnet clicked:", elementView,evt,magnet);
    paper.removeTools();
    elementView.addTools(new dia.ToolsView({ tools: [new Ports()] }));
    // 获取端口ID
    const portId = magnet.getAttribute('port');
    console.log("Port ID:", portId);
    if (!portId) return;
    
    // 清除当前Inspector
    if (currentInspectors) {
        document.getElementById('inspector').style.display = 'none';
        currentInspectors = null;
    }
    
    // 显示端口Inspector
    showPortInspector(elementView.model, portId);
});
// 监听点击空白处事件，移除所有工具
paper.on("blank:pointerdown cell:pointerdown", () => {
    paper.removeTools();
    // 清除当前Inspector
    if (currentInspectors) {
        document.getElementById('inspector').style.display = 'none';
        currentInspectors = null;
    }
});


// PaperScroller
// -------------
const paperScroller = new ui.PaperScroller({
    paper: paper,
    scrollWhileDragging: true,
    autoResizePaper: true,
});
paperContainerEl.appendChild(paperScroller.render().el);
paper.on('paper:pinch', (_evt, ox, oy, scale) => {
    const zoom = paperScroller.zoom();
    paperScroller.zoom(zoom * scale, { min: 0.2, max: 5, ox, oy, absolute: true });
});





// Stencil
// -------
const stencil = new ui.Stencil({
    paper,
    usePaperGrid: true,
    width: 100,
    height: "100%",
    paperOptions: () => {
        return {
            model: new dia.Graph({}, { cellNamespace: shapes }),
            cellViewNamespace: shapes,
            background: {
                color: "#FCFCFC"
            }
        };
    },
    groups: {
        elements: {},
        ports: {}
    },
    layout: {
        columns: 1,
        rowHeight: "compact",
        rowGap: 10,
        marginX: 40,
        marginY: 10,
        // reset defaults
        resizeToFit: false,
        dx: 0,
        dy: 0
    },
    usePaperGrid: true,
    dragStartClone: (cell) => {
        const clone = cell.clone();
        if (clone.get("port")) {
            const { width, height } = clone.size();
            clone.attr("body/fill", "lightgray");
            // Maker sure the center of the port is in the grid.
            clone.attr("body/transform", `translate(-${width / 2}, -${height / 2})`);
        } else {
            clone.resize(200, 200);
        }
        return clone;
    }
});

stencil.render();
stencilContainerEl.appendChild(stencil.el);

const stencilElements = [

    // 添加 ComponentBase 配置
    {
        type: 'ComponentBase',
        size: { width: 300 },
        name: "Component",
        className: "ComponentClass",
        classType: "Component",
        kind: componentKindOptions[0].content,
        modeler: true
    },
    // 添加 Parameters 配置
    {
        type: 'Parameters',
        size: { width: 300 },
        name: "Parameters",
        className: "ParametersClass",
        classType: "Parameters",
        color: "#E0F7FA",
        headerColor: "#B2EBF2",
        outlineColor: "#00ACC1",
        textColor: "#006064",
        itemHeight: 25,
    },
    // 添加 Events 配置
    {
        type: 'Events',
        size: { width: 300 },
        name: "Events",
        className: "EventsClass",
        classType: "Events",
        color: "#F3E5F5",
        headerColor: "#E1BEE7",
        outlineColor: "#7B1FA2",
        textColor: "#4A148C",
        itemHeight: 25,
    },
    // 添加 Commands 配置
    {
        type: 'Commands',
        size: { width: 300 },
        name: "Commands",
        className: "CommandsClass",
        classType: "Commands",
        color: "#E8F5E9",
        headerColor: "#C8E6C9",
        outlineColor: "#43A047",
        textColor: "#1B5E20",
        itemHeight: 25,
    },
    // 添加 Telemetry 配置
    {
        type: 'Telemetry',
        size: { width: 300 },
        name: "Telemetry",
        className: "TelemetryClass",
        classType: "Telemetry",
        color: "#E1F5FE",
        headerColor: "#B3E5FC",
        outlineColor: "#0288D1",
        textColor: "#01579B",
        itemHeight: 25,
    },
];

// Every stencil port element has to have a `port` property.
// The `port` property describes the port itself after it's dropped on the paper.
const stencilPorts = [
    {
        // 同步输入端口
        type: "InputPort",
        size: { width: 24, height: 24 },
        attrs: {
            body: { fill: "#ff9580" }
        },
        port: {
            markup: util.svg/*xml*/ `
                <rect @selector="portBody"
                    x="-12" y="-12" width="24" height="24"
                    fill="#ff9580" stroke="#333333" stroke-width="2" magnet="active"
                />
            `,
            properties: {
                name: "syncInput",
                kind: portKindOptions[0].value,
                namespace: "",
                priority: null,
                max_number: null,
                full: queueFullOptions[0].value,
                role: "",
                comment: "Synchronous input port",
                args: [],
                return: null,
                classType: "InputPort",
                type: "InputPort"
            }
        }
    },
    {
        // 保护输入端口
        type: "InputPort",
        size: { width: 24, height: 24 },
        attrs: {
            body: { fill: "#ffc880" }
        },
        port: {
            markup: util.svg/*xml*/ `
                <rect @selector="portBody"
                    x="-12" y="-12" width="24" height="24"
                    fill="#ffc880" stroke="#333333" stroke-width="2" magnet="active"
                />
            `,
            properties: {
                name: "guardedInput",
                kind: portKindOptions[1].value,
                namespace: "",
                priority: null,
                max_number: null,
                full: queueFullOptions[0].value,
                role: "",
                comment: "Guarded input port",
                args: [],
                return: null,
                classType: "InputPort",
                type: "InputPort"
            }
        }
    },
    {
        // 异步输入端口
        type: "InputPort",
        size: { width: 24, height: 24 },
        attrs: {
            body: { fill: "#ffff80" }
        },
        port: {
            markup: util.svg/*xml*/ `
                <rect @selector="portBody"
                    x="-12" y="-12" width="24" height="24"
                    fill="#ffff80" stroke="#333333" stroke-width="2" magnet="active"
                />
            `,
            properties: {
                name: "asyncInput",
                kind: portKindOptions[2].value,
                namespace: "",
                priority: 1,
                max_number: null,
                full: queueFullOptions[0].value,
                role: "",
                comment: "Asynchronous input port",
                args: [],
                return: null,
                classType: "InputPort",
                type: "InputPort"
            }
        }
    },
    {
        // 输出端口
        type: "OutputPort",
        size: { width: 24, height: 24 },
        attrs: {
            body: { 
                fill: "#80ff95",
            }
        },
        port: {
            markup: util.svg/*xml*/ `
                <polygon @selector="portBody"
                    points="-12,-12 12,-12 0,12"
                    fill="#80ff95" stroke="#333333" stroke-width="2" magnet="active"
                />
            `,
            properties: {
                name: "output",
                kind: portKindOptions[3].value,
                namespace: "",
                priority: null,
                max_number: null,
                full: null,
                role: "",
                comment: "Output port",
                args: [],
                return: null,
                classType: "OutputPort",
                type: "OutputPort"
            }
        }
    }
];

stencilElements.forEach(
    (element) =>
    (element.ports = {
        groups: {
            absolute: {
                position: "absolute",
                label: {
                    position: { name: "inside", args: { offset: 22 } },
                    markup: util.svg/*xml*/ `
                    <text @selector="portLabel"
                        y="0.3em"
                        fill="#333"
                        text-anchor="middle"
                        font-size="15"
                        font-family="sans-serif"
                    />
                `
                }
            }
        },
        items: []
    })
);

stencil.load({
    elements: stencilElements,
    ports: stencilPorts
});

let portIdCounter = 1;
function addElementPort(element, port, position) {
    const portId = `P-${portIdCounter++}`;
    // 端口默认属性，基于Port模型
    const defaultPortProps = {
        name: portId,                // 端口名称
        kind: "SYNC_INPUT",          // 端口类型（同步/异步输入、输出）
        namespace: "",               // C++命名空间（可选）
        priority: null,              // 异步端口的优先级（可选）
        max_number: null,            // 此类型端口的最大数量（可选）
        full: "ASSERT",              // 异步端口队列满时的行为（可选）
        role: "",                    // 建模时的端口角色（可选）
        comment: "",                 // 端口描述注释
        args: [],                    // 端口参数列表
        return: null,                // 返回值类型（可选）
    };

    // 从port.properties合并可能存在的属性
    const properties = {...defaultPortProps, ...port.properties};
    // 根据端口类型设置不同的颜色
    const portColors = {
        'SYNC_INPUT': '#ff9580',     // 同步输入端口为红色
        'GUARDED_INPUT': '#ffc880',  // 保护输入端口为橙色
        'ASYNC_INPUT': '#ffff80',    // 异步输入端口为黄色
        'OUTPUT': '#80ff95'          // 输出端口为绿色
    };

    const portColor = portColors[properties.kind] || portColors.SYNC_INPUT;

    element.addPort({
        id: portId,
        group: "absolute",
        args: position,
        properties: properties,    // 添加自定义属性
        ...util.merge(port, {
            attrs: {
                portBody: {
                    fill: portColor
                },
                portLabel: {
                    text: properties.name
                }
            }
        })
    });
    return portId;
}

stencil.on({
    "element:dragstart": (cloneView, evt) => {
        const clone = cloneView.model;
        evt.data.isPort = clone.get("port");
        paper.removeTools();
    },
    "element:dragstart element:drag": (cloneView, evt, cloneArea) => {
        if (!evt.data.isPort) {
            return;
        }
        // Note: cloneArea `topLeft` points to the center of the port because of
        // the `translate(-${width/2}, -${height/2})` transform we added to the port
        // in the `dragStartClone` callback.
        const [dropTarget] = graph.findModelsFromPoint(cloneArea.topLeft());
        if (dropTarget) {
            evt.data.dropTarget = dropTarget;
            highlighters.mask.add(
                dropTarget.findView(paper),
                "body",
                "valid-drop-target",
                {
                    layer: dia.Paper.Layers.BACK,
                    attrs: {
                        stroke: "#9580ff",
                        "stroke-width": 2
                    }
                }
            );
            highlighters.addClass.removeAll(cloneView.paper, "invalid-drop-target");
        } else {
            evt.data.dropTarget = null;
            highlighters.addClass.add(cloneView, "body", "invalid-drop-target", {
                className: "invalid-drop-target"
            });
            highlighters.mask.removeAll(paper, "valid-drop-target");
        }
    },
    "element:dragend": (cloneView, evt, cloneArea) => {
        if (!evt.data.isPort) {
            return;
        }
        const clone = cloneView.model;
        const { dropTarget } = evt.data;
        if (dropTarget) {
            stencil.cancelDrag();
            const portId = addElementPort(
                dropTarget,
                clone.get("port"),
                cloneArea.topLeft().difference(dropTarget.position()).toJSON()
            );
            
            // 稍微延迟显示端口Inspector，确保DOM已更新
            setTimeout(() => {
                showPortInspector(dropTarget, portId);
            }, 100);
        } else {
            // An invalid drop target. Animate the port back to the stencil.
            stencil.cancelDrag({ dropAnimation: true });
        }
        highlighters.mask.removeAll(paper, "valid-drop-target");
    }
});




// Port Move Tool
// --------------
// A custom element tool that allows to move a port of an element.
// The source code comes from `linkTools.Segment` and has been modified for this sample.
const PortHandle = mvc.View.extend({
    tagName: "circle",
    svgElement: true,
    className: "port-handle",
    events: {
        mousedown: "onPointerDown",
        touchstart: "onPointerDown"
    },
    documentEvents: {
        mousemove: "onPointerMove",
        touchmove: "onPointerMove",
        mouseup: "onPointerUp",
        touchend: "onPointerUp",
        touchcancel: "onPointerUp"
    },
    attributes: {
        r: 20,
        fill: "transparent",
        stroke: "#002b33",
        "stroke-width": 2,
        cursor: "grab"
    },
    position: function (x, y) {
        this.vel.attr({ cx: x, cy: y });
    },
    color: function (color) {
        this.el.style.stroke = color || this.attributes.stroke;
    },
    onPointerDown: function (evt) {
        if (this.options.guard(evt)) return;
        evt.stopPropagation();
        evt.preventDefault();
        this.options.paper.undelegateEvents();
        this.delegateDocumentEvents(null, evt.data);
        this.trigger("will-change", this, evt);
    },
    onPointerMove: function (evt) {
        this.trigger("changing", this, evt);
    },
    onPointerUp: function (evt) {
        if (evt.detail === 2) {
            this.trigger("remove", this, evt);
        } else {
            this.trigger("changed", this, evt);
            this.undelegateDocumentEvents();
        }
        this.options.paper.delegateEvents();
    }
});

const Ports = dia.ToolView.extend({
    name: "ports",
    options: {
        handleClass: PortHandle,
        activeColor: "#4666E5"
    },
    children: [
        {
            tagName: "circle",
            selector: "preview",
            className: "joint-ports-preview",
            attributes: {
                r: 13,
                "stroke-width": 2,
                fill: "#4666E5",
                "fill-opacity": 0.3,
                stroke: "#4666E5",
                "pointer-events": "none"
            }
        }
    ],
    handles: null,
    onRender: function () {
        this.renderChildren();
        this.updatePreview(null);
        this.resetHandles();
        this.renderHandles();
        return this;
    },
    update: function () {
        const positions = this.getPortPositions();
        if (positions.length === this.handles.length) {
            this.updateHandles();
        } else {
            this.resetHandles();
            this.renderHandles();
        }
        this.updatePreview(null);
        return this;
    },
    resetHandles: function () {
        const handles = this.handles;
        this.handles = [];
        this.stopListening();
        if (!Array.isArray(handles)) return;
        for (let i = 0, n = handles.length; i < n; i++) {
            handles[i].remove();
        }
    },
    renderHandles: function () {
        const positions = this.getPortPositions();
        for (let i = 0, n = positions.length; i < n; i++) {
            const position = positions[i];
            const handle = new this.options.handleClass({
                index: i,
                portId: position.id,
                paper: this.paper,
                guard: (evt) => this.guard(evt)
            });
            handle.render();
            handle.position(position.x, position.y);
            this.simulateRelatedView(handle.el);
            handle.vel.appendTo(this.el);
            this.handles.push(handle);
            this.startHandleListening(handle);
        }
    },
    updateHandles: function () {
        const positions = this.getPortPositions();
        for (let i = 0, n = positions.length; i < n; i++) {
            const position = positions[i];
            const handle = this.handles[i];
            if (!handle) return;
            handle.position(position.x, position.y);
        }
    },
    updatePreview: function (x, y) {
        const { preview } = this.childNodes;
        if (!preview) return;
        if (!Number.isFinite(x)) {
            preview.setAttribute("display", "none");
        } else {
            preview.removeAttribute("display");
            preview.setAttribute("transform", `translate(${x},${y})`);
        }
    },
    startHandleListening: function (handle) {
        this.listenTo(handle, "will-change", this.onHandleWillChange);
        this.listenTo(handle, "changing", this.onHandleChanging);
        this.listenTo(handle, "changed", this.onHandleChanged);
        this.listenTo(handle, "remove", this.onHandleRemove);
    },
    onHandleWillChange: function (handle, evt) {
        this.focus();
        handle.color(this.options.activeColor);
        const portNode = this.relatedView.findPortNode(
            handle.options.portId,
            "root"
        );
        portNode.style.opacity = 0.2;
    },
    onHandleChanging: function (handle, evt) {
        const { x, y } = this.getPositionFromEvent(evt);
        this.updatePreview(x, y);
    },
    onHandleChanged: function (handle, evt) {
        const { relatedView } = this;
        const { model } = relatedView;
        const portId = handle.options.portId;
        handle.color(null);
        const portNode = this.relatedView.findPortNode(portId, "root");
        portNode.style.opacity = "";
        this.updatePreview(null);
        const delta = this.getPositionFromEvent(evt).difference(
            relatedView.model.position()
        );
        model.portProp(
            portId,
            "args",
            { x: delta.x, y: delta.y },
            { rewrite: true, tool: this.cid }
        );
        this.resetHandles();
        this.renderHandles();
    },
    onHandleRemove: function (handle, evt) {
        const { relatedView } = this;
        const { model } = relatedView;
        const portId = handle.options.portId;
        handle.color(null);
        const portNode = this.relatedView.findPortNode(portId, "root");
        portNode.style.opacity = "";
        this.updatePreview(null);
        model.removePort(portId, { tool: this.cid });
        this.resetHandles();
        this.renderHandles();
    },
    // Get an array with all the port positions.
    getPortPositions: function () {
        const { relatedView } = this;
        const translateMatrix = relatedView.getRootTranslateMatrix();
        const rotateMatrix = relatedView.getRootRotateMatrix();
        const matrix = translateMatrix.multiply(rotateMatrix);
        const groupNames = Object.keys(relatedView.model.prop("ports/groups"));
        const portsPositions = {};
        for (let i = 0, n = groupNames.length; i < n; i++) {
            Object.assign(
                portsPositions,
                relatedView.model.getPortsPositions(groupNames[i])
            );
        }
        const positions = [];
        for (let id in portsPositions) {
            const point = V.transformPoint(portsPositions[id], matrix);
            positions.push({
                x: point.x,
                y: point.y,
                id
            });
        }
        return positions;
    },
    // Get the port position from the event coordinates.
    // The position is snapped to the point inside the element's bbox.
    getPositionFromEvent: function (evt) {
        const { relatedView } = this;
        const bbox = relatedView.model.getBBox();
        const [, x, y] = relatedView.paper.getPointerArgs(evt);
        const p = new g.Point(x, y);
        if (bbox.containsPoint(p)) {
            return p;
        }
        return bbox.pointNearestToPoint(p);
    },
    onRemove: function () {
        this.resetHandles();
    }
});


// CommandManager
const commandManager = new dia.CommandManager({
    graph: graph,
});

// ToolBar
// -------
const toolbar = new ui.Toolbar({
    autoToggle: true,
    theme: 'modern',
    tools: [
        'zoomIn',
        'zoomOut',
        'zoomToFit',
        'zoomSlider',
        'separator',
        'undo',
        'redo',
        'fullscreen',
        'separator',
        {
            type: 'button',
            name: 'xml',
            text: 'Export XML',
        }
    ],
    references: {
        paperScroller: paperScroller,
        commandManager: commandManager,
    }
});
toolbarContainerEl.appendChild(toolbar.render().el);
toolbar.on('xml:pointerclick', () => {
    // TODO Export UML diagram to XML
    console.Events('Export XML clicked');
});




// Halo
// ----
function openHalo(cellView) {
    new ui.Halo({
        cellView: cellView,
    }).removeHandle('clone').removeHandle('fork').render();
}
paper.on('cell:pointerup', (cellView) => {
    openHalo(cellView);
});



// Selection
// ---------
const selection = new ui.Selection({
    paper: paper,
});
// Initiate selecting when the user grabs the blank area of the paper.
paper.on('blank:pointerdown', selection.startSelecting);
// Select an element if CTRL/Meta key is pressed while the element is clicked.
paper.on('element:pointerup', (cellView, evt) => {
    if (evt.ctrlKey || evt.metaKey) {
        // 如果按住 CTRL/Meta 键，添加到现有选择
        selection.collection.add(cellView.model);
    } else {
        // 如果没有按住 CTRL/Meta 键，清除现有选择并选中当前元素
        selection.collection.reset([cellView.model]);
    }
});
// Unselect an element if the CTRL/Meta key is pressed while a selected element is clicked.
selection.on('selection-box:pointerdown', (elementView, evt) => {
    if (evt.ctrlKey || evt.metaKey) {
        this.selection.collection.remove(elementView.model);
    }
});
// Region Selection
const region = new ui.RectangularSelectionRegion({ paper });
paper.on('blank:pointerdown', async () => {
    const area = await region.getUserSelectionAsync();
    if (!area) return;
});




// Inspector
// --------- 
// 当前inspector实例
let currentInspectors = null;
// 点击元素时创建inspector
paper.on('element:pointerclick', (elementView, evt) => {
    if (currentInspectors) {
        document.getElementById('inspector').style.display = 'none';
    }
    currentInspectors = createInspector(elementView.model);
});
// 点击空白处隐藏inspector
paper.on('blank:pointerclick', () => {
    document.getElementById('inspector').style.display = 'none';
    currentInspectors = null;
});
// Tab切换事件监听
document.getElementById('inspector').addEventListener('click', (evt) => {
    if (evt.target.classList.contains('inspector-tab-button')) {
        openTab(evt.target.dataset.inspector);
    }
});
// 修改 showPortInspector 函数，确保属性正确同步
function showPortInspector(element, portId) {
    if (!element || !portId) return;
    console.log("element for inspector:", element);
    
    const port = element.getPort(portId);
    console.log("Port for inspector:", port);
    if (!port) return;
    
    // 确保port.properties存在
    port.properties = port.properties || {
        name: portId,
        kind: "SYNC_INPUT",
        namespace: "",
        priority: null,
        max_number: null,
        full: "ASSERT",
        role: "",
        comment: "",
        args: [],
        return: null
    };
    let tempModel = null;
    if (port.properties.classType === 'InputPort') {
        // 创建临时模型以供Inspector使用
        tempModel = new dia.Cell({
            id: `port-${portId}`,
            type: 'InputPort',
            classType: 'InputPort',  // 添加classType以匹配inspectorConfigs的键
            // 展开端口属性，确保每个属性都是顶级属性
            ...JSON.parse(JSON.stringify(port.properties))
        });
    }else{
        // 创建临时模型以供Inspector使用
        tempModel = new dia.Cell({
            id: `port-${portId}`,
            type: 'OutputPort',
            classType: 'OutputPort',  // 添加classType以匹配inspectorConfigs的键
            // 展开端口属性，确保每个属性都是顶级属性
            ...JSON.parse(JSON.stringify(port.properties))
        });
    }
    
    console.log("Port model for inspector:", tempModel.attributes);
    
    // 获取Inspector容器
    const inspectorContainer = document.getElementById('inspector');
    // 清空容器
    inspectorContainer.innerHTML = '';
    
    // 添加标题
    const titleElem = document.createElement('div');
    titleElem.className = 'inspector-title';
    titleElem.textContent = `编辑端口: ${port.properties.name}`;
    inspectorContainer.appendChild(titleElem);
    
    // 创建Inspector
    currentInspectors = createInspector(tempModel);
    
    // 使用正确的事件监听方式绑定所有可能的属性变化
    if (currentInspectors) {
        const generalInspector = currentInspectors.general;
        if(generalInspector){
            const propertyKeys = ['name', 'kind', 'namespace', 'priority', 'max_number', 'full', 'role', 'comment']
            propertyKeys.forEach(key => {
                generalInspector.on(`change:${key}`, function(value, inputEl) {
                    console.log(`Port property ${key} changed to:`, value);
                    // 更新端口属性
                    element.portProp(portId, `properties/${key}`, value);
                    if (key === 'name') {
                        // 如果是名称，同时更新显示的标签
                        element.portProp(portId, 'attrs/portLabel/text', value);
                    }else if (key === 'kind') {
                        // 如果是端口类型，更新端口颜色和形状
                        const portColors = {
                            'SYNC_INPUT': '#ff9580',
                            'GUARDED_INPUT': '#ffc880',
                            'ASYNC_INPUT': '#ffff80',
                            'OUTPUT': '#80ff95'
                        };
                        element.portProp(portId, 'attrs/portBody/fill', portColors[value] || '#ff9580');
                    }
                });
            });
        }
        
        // 监听整个args数组的变化
        const argsInspector = currentInspectors.args;
        if (argsInspector) {
            const propertyKeys = [];
            for(let i = 0; i < 5; i++){
                propertyKeys.push(`args/${i}/type`);
                propertyKeys.push(`args/${i}/pass_by`);
                propertyKeys.push(`args/${i}/name`);
                propertyKeys.push(`args/${i}/size`);
            }
            propertyKeys.forEach(key => {
                argsInspector.on(`change:${key}`, function(value, inputEl) {
                    console.log(`Port property ${key} changed to:`, value);
                    // 更新端口属性
                    element.portProp(portId, `properties/${key}`, value);
                });
            });
        }

        // 监听返回值的变化
        const returnInspector = currentInspectors.return;
        if (returnInspector) {
            const propertyKeys = ['return/type', 'return/pass_by'];
            propertyKeys.forEach(key => {
                returnInspector.on(`change:${key}`, function(value, inputEl) {
                    console.log(`Port property ${key} changed to:`, value);
                    // 更新端口属性
                    element.portProp(portId, `properties/${key}`, value);
                });
            });
        }
    }
    
    // 显示Inspector
    inspectorContainer.style.display = 'block';
}

// Keyboard
// --------
// TODO Keyboard shortcuts
const clipboard = new ui.Clipboard({ useLocalStorage: false });
const keyboard = new ui.Keyboard;
// 
keyboard.on('ctrl+c', () => clipboard.copyElements(selection.collection, paper.model));
keyboard.on('ctrl+x', () => clipboard.cutElements(selection.collection, paper.model));
keyboard.on('ctrl+v', () => clipboard.pasteCells(paper.model));
keyboard.on('ctrl+a', (evt) => {
    // 阻止浏览器默认的全选行为
    evt.preventDefault();
    // 获取图上所有元素
    const elements = graph.getElements();
    // 将所有元素添加到选择集合中
    selection.collection.reset(elements);
});
keyboard.on('delete', () => {
    // 获取当前选中的所有元素并转换为数组
    const cells = selection.collection.toArray();
    // 删除所有选中的元素
    cells.forEach(cell => cell.remove());
    // 清空选择集合
    selection.collection.reset();
});