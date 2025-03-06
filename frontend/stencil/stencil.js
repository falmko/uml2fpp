import { dia, shapes, ui, format, util, highlighters, mvc, V, g, layout } from '@joint/plus';
import { queueFullOptions } from '../shapes/commands';
import { portKindOptions } from '../shapes/port';
import { componentKindOptions } from '../shapes/compoent_base';
import { addElementPort } from '../port_move_tool/port_move_tool';
import { showPortInspector } from '../inspectors/inspectors';
import { createFprimeArchitectureLayout } from '../shapes/fprime_architecture';

const stencilArchitectures = [
    {   
        // FPrime架构
        type: 'standard.Path',
        isArchitecture: true, // 标记为架构类型
        size: { width: 40, height: 130 },
        attrs: {
            body: {
                d: "M 51.2 97.28 a 46.08 46.08 90 1 0 0 -92.16 a 46.08 46.08 90 0 0 0 92.16 z M 40.96 34.0684 v -13.312 c 0 -0.5632 0.4608 -1.024 1.024 -1.024 h 18.432 c 0.5632 0 1.024 0.4608 1.024 1.024 v 13.312 a 1.024 1.024 90 0 1 -1.024 1.024 H 41.984 a 1.024 1.024 90 0 1 -1.024 -1.024 z m 6.7482 14.9964 H 30.6176 a 1.024 1.024 90 0 0 -1.024 1.024 v 12.4724 a 2.5088 2.5088 90 1 1 -5.0176 0 V 45.4348 c 0 -0.5632 0.4608 -1.024 1.024 -1.024 h 22.1082 a 1.024 1.024 90 0 0 1.024 -1.024 v -4.3264 a 2.5088 2.5088 90 0 1 5.0176 0 v 4.3264 c 0 0.5632 0.4608 1.024 1.024 1.024 h 21.5962 c 0.5632 0 1.024 0.4608 1.024 1.024 v 17.1264 a 2.5088 2.5088 90 1 1 -5.0176 0 V 50.089 a 1.024 1.024 90 0 0 -1.024 -1.024 h -16.5786 a 1.024 1.024 90 0 0 -1.024 1.024 v 12.4724 a 2.5088 2.5088 90 0 1 -5.0176 0 V 50.089 a 1.024 1.024 90 0 0 -1.024 -1.024 z m 19.6762 27.7094 v -8.192 c 0 -0.5632 0.4556 -1.024 1.024 -1.024 h 13.312 c 0.5632 0 1.024 0.4608 1.024 1.024 v 8.192 a 1.024 1.024 90 0 1 -1.024 1.024 h -13.312 a 1.024 1.024 90 0 1 -1.024 -1.024 z m -23.6492 0 v -8.192 c 0 -0.5632 0.4608 -1.024 1.024 -1.024 h 13.312 c 0.5632 0 1.024 0.4608 1.024 1.024 v 8.192 a 1.024 1.024 90 0 1 -1.024 1.024 h -13.312 a 1.024 1.024 90 0 1 -1.024 -1.024 z m -24.2228 0 v -8.192 c 0 -0.5632 0.4608 -1.024 1.024 -1.024 h 13.312 c 0.5632 0 1.024 0.4608 1.024 1.024 v 8.192 a 1.024 1.024 90 0 1 -1.024 1.024 h -13.312 a 1.024 1.024 90 0 1 -1.024 -1.024 z",
                fill: "#000000"
            },
            label: {
                text: "FPrime Architecture",
                fill: "#000000",
                x: 50,
                y: 120,
            }
        }
    }
];

const defaultElements = [
    {
        type: 'standard.Path',
        isComponent: true, // 标记为组件类型
        size: { width: 50, height: 100 },
        attrs: {
            body: {
                d: "M 55.296 66.816 H 9.216 A 2.304 2.304 90 0 1 6.912 64.512 V 18.432 A 2.304 2.304 90 0 1 9.216 16.128 H 23.3165 A 9.5386 9.5386 90 0 1 23.04 13.824 A 9.216 9.216 90 0 1 41.472 13.824 A 9.5386 9.5386 90 0 1 41.1955 16.128 H 55.296 A 2.304 2.304 90 0 1 57.6 18.432 V 32.5325 A 9.5386 9.5386 90 0 1 59.904 32.256 A 9.216 9.216 90 0 1 59.904 50.688 A 9.5386 9.5386 90 0 1 57.6 50.4115 V 64.512 A 2.304 2.304 90 0 1 55.296 66.816 Z M 11.52 62.208 H 52.992 V 46.5869 A 2.3501 2.3501 90 0 1 54.3744 44.4672 A 2.3501 2.3501 90 0 1 56.8166 44.8819 A 4.608 4.608 90 1 0 56.8166 38.0621 A 2.2579 2.2579 90 0 1 54.3744 38.4768 A 2.3501 2.3501 90 0 1 52.992 36.3571 V 20.736 H 37.3709 A 2.3501 2.3501 90 0 1 35.2512 19.3536 A 2.2579 2.2579 90 0 1 35.6659 16.9114 A 4.608 4.608 90 1 0 28.8461 16.9114 A 2.2579 2.2579 90 0 1 29.2608 19.3536 A 2.3501 2.3501 90 0 1 27.1411 20.736 H 11.52 Z",
                fill: "#4D4D4D"
            },
            label: {
                text: "Component",
                fill: "#000000",
                x: 35,
                y: 80,
            }
        }
    },
    {
        // 输入端口
        type: "InputPort",
        size: { width: 24, height: 24 },
        attrs: {
            body: { fill: "#ff9580" },
            label: {
                text: "inport",
                fill: "#000000",
                x: 50,
            }
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
        // 输出端口
        type: "OutputPort",
        size: { width:24, height: 24 },
        attrs: {
            body: {
                fill: "#80ff95",
            },
            label: {
                text: "outport",
                fill: "#000000",
                x: 55,
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
]

// TODO 从文件中导入组件到组件库、导出组件到组件库


export function NewStencil(graph, paper, cellViewNamespace, stencilContainerEl, inspectorContainer) {
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
            // elements: {},
            // ports: {},
            default: {},
            architectures: {},
            component_lib: {}
        },
        layout: {
            columns: 1,
            rowHeight: "compact",
            rowGap: 10,
            marginX: 40,
            marginY: 10,
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
        default: defaultElements,
        architectures: stencilArchitectures
    });

    stencil.on({
        "element:dragstart": (cloneView, evt) => {
            const clone = cloneView.model;
            // 通过事件数据传递信息
            evt.data.isPort = clone.get("port");
            evt.data.isArchitecture = clone.get("isArchitecture");
            evt.data.isComponent = clone.get("isComponent");
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
            if (evt.data.isPort) {
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
                        showPortInspector(dropTarget, portId, inspectorContainer);
                    }, 100);
                } else {
                    // An invalid drop target. Animate the port back to the stencil.
                    stencil.cancelDrag({ dropAnimation: true });
                }
                highlighters.mask.removeAll(paper, "valid-drop-target");
            } else if (evt.data.isArchitecture) {
                // 创建架构布局
                stencil.cancelDrag();
                const components = createFprimeArchitectureLayout(cloneArea.center());
                components.forEach((component) => {
                    graph.addCell(component);
                });
            } else if (evt.data.isComponent) {
                stencil.cancelDrag();
                const component = new shapes.ComponentBase({
                    size: { width: 300, height: 200 },
                    position: cloneArea.center(),
                    name: "Component1",
                    type: 'ComponentBase',

                    className: "ComponentClass",
                    classType: "Component",
                    kind: componentKindOptions[0].content,
                    modeler: false
                });

                // add port move tool
                component.set('ports', {
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
                });
                graph.addCell(component);
            }

        }
    });
}