import { dia, shapes, ui, format, util, highlighters, mvc, V, g } from '@joint/plus';
import { queueFullOptions } from '../shapes/commands';
import { portKindOptions } from '../shapes/port';
import {componentKindOptions} from '../shapes/compoent_base';
import { addElementPort } from '../port_move_tool/port_move_tool';
import { showPortInspector } from '../inspectors/inspectors';
// Stencil
// -------

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

export function NewStencil(graph, paper,cellViewNamespace,stencilContainerEl,inspectorContainer) {
    const stencil = new ui.Stencil({
        paper,
        usePaperGrid: true,
        width: 100,
        height: "100%",
        paperOptions: () => {
            return {
                model: new dia.Graph({}, { cellNamespace: cellViewNamespace }),
                cellViewNamespace: cellViewNamespace,
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

    stencil.load({
        elements: stencilElements,
        ports: stencilPorts
    });

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
            //  检查放置目标是否为 ComponentBase 类型
            if (dropTarget && dropTarget instanceof shapes.ComponentBase) {
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
            // 确保放置目标为 ComponentBase 类型
            if (dropTarget && dropTarget instanceof shapes.ComponentBase) {
                stencil.cancelDrag();
                const portId = addElementPort(
                    dropTarget,
                    clone.get("port"),
                    cloneArea.topLeft().difference(dropTarget.position()).toJSON()
                );
                
                // 稍微延迟显示端口Inspector，确保DOM已更新
                setTimeout(() => {
                    showPortInspector(dropTarget, portId,inspectorContainer);
                }, 100);
            } else {
                // An invalid drop target. Animate the port back to the stencil.
                stencil.cancelDrag({ dropAnimation: true });
            }
            highlighters.mask.removeAll(paper, "valid-drop-target");
        }
    });
    
}