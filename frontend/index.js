import { dia, shapes, ui, format, util, highlighters, mvc, V, g } from '@joint/plus';

import './joint-plus.css';
import './styles.css';
import { UMLClass, typeOptions } from './shapes/shapes'
import { Telemetry } from './shapes/telemetry';
import { Log } from './shapes/log';
import { Severity } from './models/event';
import { Dependency } from './shapes/link';

// const namespace = { ...shapes, myNamespace: { UMLClass } };
shapes.UMLClass = UMLClass;
shapes.UMLClassView = shapes.standard.HeaderedRecordView;
shapes.Telemetry = Telemetry;
shapes.TelemetryView = shapes.standard.HeaderedRecordView;
shapes.Log = Log;
shapes.LogView = shapes.standard.HeaderedRecordView;
shapes.Dependency = Dependency;

const graph = new dia.Graph({}, { cellNamespace: shapes })

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
        return new shapes.Dependency();
    },
    defaultRouter: { name: 'orthogonal' },
    defaultConnector: { name: 'straight', args: { cornerType: 'line' } },
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
            // 只有当两端都是端口，且都是UMLClass的端口时才允许连接
            return (sourceMagnet && targetMagnet &&
                sourceModel instanceof shapes.UMLClass &&
                targetModel instanceof shapes.UMLClass);
        }

        // 如果源是UMLClass（且不是端口连接）
        if (sourceModel instanceof shapes.UMLClass) {
            // 目标必须是Log或Telemetry，且不能是端口连接
            return (targetModel instanceof shapes.Log ||
                targetModel instanceof shapes.Telemetry) &&
                !targetMagnet;  // 确保目标不是端口
        }

        // 如果源是Log或Telemetry，不允许作为连接的起点
        if (sourceModel instanceof shapes.Log ||
            sourceModel instanceof shapes.Telemetry) {
            return false;
        }

        return true;
    },
    snapLinks: { radius: 10 }
});
// paperContainerEl.appendChild(paper.el);
// 监听点击端口事件，添加端口工具
paper.on("element:magnet:pointerclick", (elementView, evt, magnet) => {
    paper.removeTools();
    elementView.addTools(new dia.ToolsView({ tools: [new Ports()] }));
});
// 监听点击空白处事件，移除所有工具
paper.on("blank:pointerdown cell:pointerdown", () => {
    paper.removeTools();
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
    {
        type: "standard.Rectangle",
        size: { width: 80, height: 60 },
        attrs: {
            body: {
                fill: "#80ffd5"
            }
        }
    },
    {
        type: "standard.Rectangle",
        size: { width: 80, height: 60 },
        attrs: {
            body: {
                rx: 10,
                ry: 10,
                fill: "#48cba4"
            }
        }
    },
    {
        type: 'UMLClass',
        size: { width: 200 },
        name: "UML Class",
        className: "ClassName",
        classType: "ClassType",
        outlineColor: "#ff9580",
        color: "#ffeae5",
        headerColor: "#ffd4cc",
        textColor: "#002b33",
        itemHeight: 25,
        attributes: [
            {
                visibility: "-",
                name: "parameter",
                returnType: 2,
                isStatic: false
            }
        ],
        operations: [
            {
                visibility: "+",
                name: "command",
                returnType: 4,
                parameters: [],
                isStatic: false
            }
        ],
    }
];

// Every stencil port element has to have a `port` property.
// The `port` property describes the port itself after it's dropped on the paper.
const stencilPorts = [
    {
        type: "standard.Rectangle",
        size: { width: 24, height: 24 },
        attrs: {
            body: {
                fill: "#ff9580"
            }
        },
        port: {
            markup: util.svg/*xml*/ `
                <rect @selector="portBody"
                    x="-12"
                    y="-12"
                    width="24"
                    height="24"
                    fill="#ff9580"
                    stroke="#333333"
                    stroke-width="2"
                    magnet="active"
                />
            `
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
    element.addPort({
        id: portId,
        group: "absolute",
        args: position,
        ...util.merge(port, {
            attrs: {
                portLabel: {
                    text: portId
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
            addElementPort(
                dropTarget,
                clone.get("port"),
                cloneArea.topLeft().difference(dropTarget.position()).toJSON()
            );
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
    console.log('Export XML clicked');
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
// TODO add inspector





// Keyboard
// --------
// TODO Keyboard shortcuts
const clipboard = new ui.Clipboard({ useLocalStorage: false });
const keyboard = new ui.Keyboard;
// 
keyboard.on('ctrl+c', () => clipboard.copyElements(selection.collection, paper.model));
keyboard.on('ctrl+x', () => clipboard.cutElements(selection.collection, paper.model));
keyboard.on('ctrl+v', () => clipboard.pasteCells(paper.model));
keyboard.on('delete', () => {
    // 获取当前选中的所有元素并转换为数组
    const cells = selection.collection.toArray();
    // 删除所有选中的元素
    cells.forEach(cell => cell.remove());
    // 清空选择集合
    selection.collection.reset();
});



// Example graph
// -------------
graph.addCells([
    {
        ...stencilElements[2],
        id: "r1",
        position: { x: 40, y: 100 },
        size: { width: 200, height: 200 }
    }
]);
const r1 = graph.getCell("r1");
const r1p1 = addElementPort(r1, stencilPorts[0].port, { x: "100%", y: 20 });
const r1p2 = addElementPort(r1, stencilPorts[0].port, { x: "0%", y: 60 });
const telemetry = new Telemetry({
    position: { x: 300, y: 100 },
    size: { width: 300 },  // 移除固定高度，让它自动计算
    telemetry_base: 100,
    className: "telemetry_example",
    classType: "telemetry",  // 添加这行
    channels: [
        {
            visibility: "+",
            id: 1,
            name: "channel1",
            data_type: 0,
            size: 1,
            update_type: 0,
            abbrev: "ch1",
            format_string: "",
            comment: "Test channel"
        },
        {
            visibility: "+",
            id: 2,
            name: "channel2",
            data_type: 8,
            size: 1,
            update_type: 1,
            abbrev: "ch2",
            format_string: "",
            comment: "Another test channel"
        }
    ]
});
graph.addCells([telemetry]);
// 创建 Log 实例
const log = new Log({
    position: { x: 500, y: 100 },
    size: { width: 300 },
    className: "SystemLog",
    classType: "log",
    events: [
        {
            id: 1,
            name: "StartupComplete",
            severity: Severity.ACTIVITY_HI,
            format_string: "System startup completed",
            args: []
        },
        {
            id: 2,
            name: "ConfigError",
            severity: Severity.WARNING_HI,
            format_string: "Configuration error: %s",
            args: [
                { name: "errorMsg", type: "string" }
            ]
        }
    ]
});

graph.addCells([log]);

const visibilityOptions = [
    {
        value: "+",
        content: "Public"
    },
    {
        value: "-",
        content: "Private"
    },
    {
        value: "#",
        content: "Protected"
    },
    {
        value: "/",
        content: "Derived"
    },
    {
        value: "~",
        content: "Package"
    }
];
const umlClass1 = new UMLClass({
    position: { x: 100, y: 100 }, // 添加位置信息
    size: { width: 200 }, // 添加宽度信息
    className: "Shape",
    classType: "interface",
    outlineColor: "#ff9580",
    color: "#ffeae5",
    headerColor: "#ffd4cc",
    textColor: "#002b33",
    itemHeight: 25,
    attributes: [
        {
            visibility: "-",
            name: "x",
            returnType: 2
        },
        {
            visibility: "-",
            name: "y",
            returnType: 3
        }
    ],
    operations: [
        {
            visibility: "+",
            name: "getPosition",
            parameters: [],
            returnType: 5
        },
        {
            visibility: "+",
            name: "setPosition",
            parameters: [
                { name: "x", type: 2 },
                { name: "y", type: 2 }
            ],
            returnType: 4
        },
        {
            visibility: "+",
            name: "isShape",
            parameters: [{ name: "shape", type: 7 }],
            returnType: 0,
            isStatic: true
        }
    ],
    // 添加端口组配置
    ports: {
        groups: {
            absolute: {
                position: "absolute",
                label: {
                    position: { name: "inside", args: { offset: 22 } },
                    markup: util.svg`
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
        items: [] // 初始化空的端口列表
    }
});

graph.addCells([umlClass1]);
const r1p11 = addElementPort(umlClass1, stencilPorts[0].port, { x: "100%", y: 20 });

const inspectorGeneral = new ui.Inspector({
    cell: umlClass1,
    inputs: {
        className: {
            type: "text",
            group: "name",
            label: "Class name"
        },
        classType: {
            type: "text",
            group: "name",
            label: "Class type"
        },
        color: {
            type: "color",
            group: "presentation",
            label: "Color"
        },
        headerColor: {
            type: "color",
            group: "presentation",
            label: "Header Color"
        },
        outlineColor: {
            type: "color",
            group: "presentation",
            label: "Outline color"
        },
        textColor: {
            type: "color",
            group: "presentation",
            label: "Text color"
        }
    },
    groups: {
        name: {
            index: 1
        },
        presentation: {
            index: 2
        }
    }
});

inspectorGeneral.render();
document.getElementById("inspector-general").appendChild(inspectorGeneral.el);

const inspectorAttributes = new ui.Inspector({
    cell: umlClass1,
    inputs: {
        attributes: {
            type: "list",
            addButtonLabel: "Add Attribute",
            item: {
                type: "object",
                properties: {
                    name: {
                        type: "text",
                        label: "Attribute",
                        index: 1
                    },
                    visibility: {
                        type: "select",
                        options: visibilityOptions,
                        label: "Visibility",
                        index: 2
                    },
                    returnType: {
                        type: "select",
                        options: typeOptions,
                        label: "Return type",
                        index: 3
                    },
                    isStatic: {
                        type: "toggle",
                        index: 4,
                        label: "Static Attribute"
                    }
                }
            }
        }
    }
});

inspectorAttributes.render();
document
    .getElementById("inspector-attributes")
    .appendChild(inspectorAttributes.el);

const inspectorOperations = new ui.Inspector({
    cell: umlClass1,
    inputs: {
        operations: {
            type: "list",
            addButtonLabel: "Add Operation",
            item: {
                type: "object",
                properties: {
                    name: {
                        type: "text",
                        label: "Operation",
                        index: 1
                    },
                    visibility: {
                        type: "select",
                        options: visibilityOptions,
                        label: "Visibility",
                        index: 2
                    },
                    returnType: {
                        type: "select",
                        options: typeOptions,
                        label: "Return type",
                        index: 3
                    },
                    isStatic: {
                        type: "toggle",
                        index: 4,
                        label: "Static Operation"
                    },
                    parameters: {
                        type: "list",
                        item: {
                            type: "object",
                            properties: {
                                name: {
                                    type: "text",
                                    index: 1,
                                    label: "Parameter name"
                                },
                                type: {
                                    type: "select",
                                    options: typeOptions,
                                    index: 2,
                                    label: "Parameter type"
                                }
                            }
                        },
                        label: "Parameters",
                        index: 5
                    }
                }
            }
        }
    }
});

inspectorOperations.render();
document
    .getElementById("inspector-operations")
    .appendChild(inspectorOperations.el);

function openTab(tabName) {
    const t = document.getElementsByClassName("inspector-tab");
    for (let i = 0; i < t.length; i++) {
        t[i].style.display = t[i].id === tabName ? "block" : "none";
    }
    const b = document.getElementsByClassName("inspector-tab-button");
    for (let i = 0; i < b.length; i++) {
        b[i].classList.toggle("active", b[i].dataset.inspector === tabName);
    }
}

document.getElementById("inspector").addEventListener("click", (evt) => {
    if (!evt.target.classList.contains("inspector-tab-button")) return;
    openTab(evt.target.dataset.inspector);
});

openTab("inspector-general");

paper.translate(paper.getArea().width / 2 - umlClass1.size().width / 2, 20);