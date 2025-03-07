import { dia, shapes, ui, format, util, highlighters, mvc, V, g, layout } from '@joint/plus';
import { queueFullOptions } from '../shapes/commands';
import { portKindOptions } from '../shapes/port';
import { componentKindOptions } from '../shapes/compoent_base';
import { addElementPort, defaultPortsConfig } from '../port_move_tool/port_move_tool';
import { showPortInspector } from '../inspectors/inspectors';
import { createFprimeArchitectureLayout } from '../shapes/fprime_architecture';
import { subElements } from '../subgraph/subgraph';
import { createSubElement, elementTypes } from '../subgraph/subgraph';

// 元素配置数据
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

// 预定义端口和组件配置
const inputPortConfig = {
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
};

const outputPortConfig = {
    type: "OutputPort",
    size: { width: 24, height: 24 },
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
};

const componentConfig = {
    type: 'standard.Path',
    isComponent: true,
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
};

// 默认元素配置集合
const defaultElements = [
    inputPortConfig,
    outputPortConfig,
    componentConfig,
];

// 组件库集合
let libComponents = [];

/**
 * 从后端获取组件库
 * @returns {Promise<Array>} 组件库元素数组
 */
async function loadComponentLibrary() {
    try {
        const response = await fetch('http://127.0.0.1:5000/component_lib');
        if (!response.ok) {
            throw new Error(`HTTP error ${response.status}`);
        }

        const data = await response.json();
        if (data.status === 'success') {
            return createLibComponentElements(data.components);
        } else {
            console.error('加载组件库失败:', data.message);
            return [];
        }
    } catch (error) {
        console.error('加载组件库出错:', error);
        return [];
    }
}

/**
 * 从组件名称创建库组件元素
 * @param {Array<string>} componentNames 组件名称数组
 * @returns {Array} 组件元素配置数组
 */
function createLibComponentElements(componentNames) {
    const components = componentNames.map(componentName => ({
        type: 'standard.Path',
        isLibComponent: true,
        size: { width: 50, height: 60 },
        attrs: {
            body: {
                d: "M 38.7072 46.7712 H 6.4512 A 1.6128 1.6128 90 0 1 4.8384 45.1584 V 12.9024 A 1.6128 1.6128 90 0 1 6.4512 11.2896 H 16.3215 A 6.677 6.677 90 0 1 16.128 9.6768 A 6.4512 6.4512 90 0 1 29.0304 9.6768 A 6.677 6.677 90 0 1 28.8368 11.2896 H 38.7072 A 1.6128 1.6128 90 0 1 40.32 12.9024 V 22.7727 A 6.677 6.677 90 0 1 41.9328 22.5792 A 6.4512 6.4512 90 0 1 41.9328 35.4816 A 6.677 6.677 90 0 1 40.32 35.288 V 45.1584 A 1.6128 1.6128 90 0 1 38.7072 46.7712 Z M 8.064 43.5456 H 37.0944 V 32.6108 A 1.6451 1.6451 90 0 1 38.0621 31.127 A 1.6451 1.6451 90 0 1 39.7716 31.4173 A 3.2256 3.2256 90 1 0 39.7716 26.6435 A 1.5805 1.5805 90 0 1 38.0621 26.9338 A 1.6451 1.6451 90 0 1 37.0944 25.45 V 14.5152 H 26.1596 A 1.6451 1.6451 90 0 1 24.6758 13.5475 A 1.5805 1.5805 90 0 1 24.9661 11.838 A 3.2256 3.2256 90 1 0 20.1923 11.838 A 1.5805 1.5805 90 0 1 20.4826 13.5475 A 1.6451 1.6451 90 0 1 18.9988 14.5152 H 8.064 Z",
                fill: "#D3D3D3"
            },
            label: {
                text: componentName,
                fill: "#000000",
                x: 35,
                y: 60,
            }
        },
        componentName
    }));

    libComponents = components;
    console.log('组件库加载成功:', libComponents);
    return components;
}

/**
 * 创建基本组件实例
 * @param {Object} position 位置坐标
 * @param {string} name 组件名称
 * @returns {Object} 组件实例
 */
function createBasicComponent(position, name = "Component1") {
    return new shapes.ComponentBase({
        size: { width: 300, height: 200 },
        position,
        name,
        type: 'ComponentBase',
        className: "ComponentClass",
        classType: "Component",
        kind: componentKindOptions[0].content,
        modeler: false,
        ports: defaultPortsConfig
    });
}

/**
 * 创建库组件
 * @param {Object} componentData 组件数据
 * @param {Object} position 位置坐标
 * @returns {Object} 库组件实例
 */
function createLibComponent(componentData, position) {
    const component = new shapes.ComponentBase({
        size: { width: 300, height: 200 },
        position,
        name: componentData.name,
        type: "ComponentBase",
        className: componentData.name,
        classType: "Component",
        kind: componentData.kind || "ACTIVE",
        modeler: componentData.modeler || false,
        comment: componentData.comment || "",
        specification: componentData.specification || ""
    });

    // 设置端口组
    component.set('ports', componentData.ports || defaultPortsConfig);

    return component;
}

/**
 * 处理端口拖放
 * @param {Object} cloneView 克隆视图
 * @param {Object} evt 事件对象
 * @param {Object} cloneArea 克隆区域
 * @param {Object} options 选项对象
 */
function handlePortDragDrop(cloneView, evt, cloneArea, { graph, paper, stencil, inspectorContainer }) {
    const clone = cloneView.model;
    const { dropTarget } = evt.data;

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
        // 无效的放置目标，将端口动画返回至工具栏
        stencil.cancelDrag({ dropAnimation: true });
    }

    highlighters.mask.removeAll(paper, "valid-drop-target");
}

/**
 * 创建并添加库组件的子元素
 * @param {Object} componentData 组件数据
 * @param {string} componentId 组件ID
 * @returns {Object} 子元素和连接
 */
function createLibComponentSubElements(componentData, componentId) {
    const subElementsInstances = {};
    const links = [];

    elementTypes.forEach(elementType => {
        if (componentData[elementType]) {
            const result = createSubElement(
                componentData,
                elementType,
                componentId
            );

            if (result) {
                subElementsInstances[elementType] = result.element;
                links.push(result.link);
            }
        }
    });

    if (Object.keys(subElementsInstances).length > 0) {
        subElementsInstances.Links = links;
        subElements.set(componentId, subElementsInstances);
    }

    return { subElementsInstances, links };
}

/**
 * 处理库组件拖放
 * @param {Object} clone 克隆模型
 * @param {Object} cloneArea 克隆区域
 * @param {Object} options 选项对象
 */
function handleLibComponentDragDrop(clone, cloneArea, { graph }) {
    const componentName = clone.get('componentName');

    // 获取组件详细信息
    fetch(`http://127.0.0.1:5000/component_lib/${componentName}`)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            if (data.status === 'success') {
                const componentData = data.data;

                // 创建组件实例并添加到图表
                const component = createLibComponent(componentData, cloneArea.center());
                graph.addCell(component);

                // 创建子元素和连接
                const { subElementsInstances } = createLibComponentSubElements(componentData, component.id);

                console.log('已创建库组件及子元素:', component.id, subElementsInstances);
            } else {
                console.error('获取组件详情失败:', data.message);
            }
        })
        .catch(error => {
            console.error('获取组件详情出错:', error);
        });
}

/**
 * 创建新的模具工具栏
 * @param {Object} graph 图表对象
 * @param {Object} paper 画布对象
 * @param {Object} cellNamespace 单元视图命名空间
 * @param {HTMLElement} stencilContainerEl 容器元素
 * @param {HTMLElement} inspectorContainer 检查器容器
 */
export function NewStencil(graph, paper, cellNamespace, stencilContainerEl, inspectorContainer) {
    // 创建模具配置
    const stencil = new ui.Stencil({
        paper,
        width: 100,
        height: "100%",
        paperOptions: () => ({
            model: new dia.Graph({}, { cellNamespace }),
            cellNamespace,
            background: {
                color: "#FCFCFC"
            }
        }),
        groups: {
            default: {},
            architectures: {},
            component_lib: {}
        },
        layout: {
            columns: 2,
            rowHeight: "compact",
            rowGap: 10,
            columnGap: 40,
            marginX: 40,
            marginY: 10,
        },
        usePaperGrid: true,
        dragStartClone: (cell) => {
            const clone = cell.clone();
            if (clone.get("port")) {
                const { width, height } = clone.size();
                clone.attr("body/fill", "lightgray");
                clone.attr("body/transform", `translate(-${width / 2}, -${height / 2})`);
            } else {
                clone.resize(200, 200);
            }
            return clone;
        }
    });

    // 渲染模具并加载默认元素
    stencil.render();
    stencilContainerEl.appendChild(stencil.el);
    stencil.load({
        default: defaultElements,
        architectures: stencilArchitectures
    });

    // 加载组件库
    loadComponentLibrary().then(components => {
        if (components && components.length > 0) {
            stencil.load({
                component_lib: components
            });
        }
    });

    // 事件处理器配置
    const eventHandlerOptions = { graph, paper, stencil, inspectorContainer };

    // 绑定事件
    stencil.on({
        "element:dragstart": (cloneView, evt) => {
            const clone = cloneView.model;
            // 通过事件数据传递信息
            evt.data.isPort = clone.get("port");
            evt.data.isArchitecture = clone.get("isArchitecture");
            evt.data.isComponent = clone.get("isComponent");
            evt.data.isLibComponent = clone.get("isLibComponent");
            paper.removeTools();
        },

        "element:dragstart element:drag": (cloneView, evt, cloneArea) => {
            if (!evt.data.isPort) return;

            const [dropTarget] = graph.findModelsFromPoint(cloneArea.topLeft());

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
                handlePortDragDrop(cloneView, evt, cloneArea, eventHandlerOptions);
            } else if (evt.data.isArchitecture) {
                // 创建架构布局
                stencil.cancelDrag();
                const components = createFprimeArchitectureLayout(cloneArea.center());
                components.forEach(component => graph.addCell(component));
            } else if (evt.data.isComponent) {
                // 创建普通组件
                stencil.cancelDrag();
                const component = createBasicComponent(cloneArea.center());
                graph.addCell(component);
            } else if (evt.data.isLibComponent) {
                // 处理从组件库拖拽的组件
                stencil.cancelDrag();
                handleLibComponentDragDrop(cloneView.model, cloneArea, eventHandlerOptions);
            }
        }
    });

    return stencil;
}