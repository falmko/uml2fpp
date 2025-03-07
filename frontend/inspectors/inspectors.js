import { ui, dia } from '@joint/plus';
import { componentKindOptions } from '../shapes/compoent_base';
import { commandKindOptions, queueFullOptions } from '../shapes/commands';
import { fppTypeOptions, updateTypeOptions } from '../shapes/telemetry';
import { CommandKind } from '../models/command';
import { severityOptions } from '../shapes/events';
import { portKindOptions,portColors } from '../shapes/port';
import { PortKind } from '../models/port';
import { passByOptions } from '../shapes/port';

/**
 * Inspector 模块 - 用于管理和创建元素属性检查器
 */

// 当前inspector实例
let currentInspectors = null;

/**
 * 初始化Inspector及其事件监听
 * @param {Object} paper - JointJS paper对象
 * @param {HTMLElement} inspectorContainer - 包含Inspector的DOM元素
 */
export function NewInspector(paper, inspectorContainer) {
    // 设置事件监听
    setupEventListeners(paper, inspectorContainer);
}

/**
 * 设置Inspector相关的所有事件监听器
 */
function setupEventListeners(paper, inspectorContainer) {
    // 点击元素时创建inspector
    paper.on('element:pointerclick', (elementView, evt) => {
        if (getCurrentInspectors()) {
            document.getElementById('inspector').style.display = 'none';
        }
        createInspector(elementView.model, inspectorContainer);
    });

    // 点击空白处隐藏inspector
    paper.on('blank:pointerclick', () => {
        inspectorContainer.style.display = 'none';
        setCurrentInspectors(null);
    });

    // Tab切换事件监听
    inspectorContainer.addEventListener('click', (evt) => {
        if (evt.target.classList.contains('inspector-tab-button')) {
            openTab(evt.target.dataset.inspector);
        }
    });
}

/**
 * 获取当前活动的Inspector实例
 * @returns {Object|null} 当前Inspector实例
 */
export function getCurrentInspectors() {
    return currentInspectors;
}

/**
 * 设置当前活动的Inspector实例
 * @param {Object|null} inspectors - Inspector实例
 */
export function setCurrentInspectors(inspectors) {
    currentInspectors = inspectors;
}

/**
 * 根据元素类型创建适当的Inspector
 * @param {Object} cell - JointJS cell对象
 * @param {HTMLElement} inspectorContainer - 包含Inspector的DOM元素
 * @returns {Object|null} 创建的Inspector对象或null
 */
export function createInspector(cell, inspectorContainer) {
    if (!cell) return null;

    const classType = cell.get('classType') || cell.get('type');
    const config = inspectorConfigs[classType];
    if (!config) return null;

    // 清空容器
    inspectorContainer.innerHTML = '';

    // 创建UI组件
    createTabButtons(config.tabs, inspectorContainer);
    const inspectors = createTabContents(config, cell, inspectorContainer);

    // 显示Inspector并激活第一个标签
    inspectorContainer.style.display = 'block';
    openTab(`inspector-${config.tabs[0]}`);

    currentInspectors = inspectors;
    return inspectors;
}

/**
 * 创建标签页按钮
 * @param {Array} tabs - 标签页名称数组
 * @param {HTMLElement} container - 容器元素
 */
function createTabButtons(tabs, container) {
    const tabButtons = document.createElement('div');
    tabButtons.className = 'inspector-tabs';

    tabs.forEach(tabName => {
        const button = document.createElement('button');
        button.className = 'inspector-tab-button';
        button.dataset.inspector = `inspector-${tabName}`;
        button.textContent = tabName.charAt(0).toUpperCase() + tabName.slice(1);
        tabButtons.appendChild(button);
    });

    container.appendChild(tabButtons);
}

/**
 * 创建标签页内容
 * @param {Object} config - Inspector配置
 * @param {Object} cell - JointJS cell对象
 * @param {HTMLElement} container - 容器元素
 * @returns {Object} 创建的Inspector对象集合
 */
function createTabContents(config, cell, container) {
    const inspectors = {};

    config.tabs.forEach(tabName => {
        const tabContent = document.createElement('div');
        tabContent.id = `inspector-${tabName}`;
        tabContent.className = 'inspector-tab';
        container.appendChild(tabContent);

        const inspector = new ui.Inspector({
            cell: cell,
            inputs: config.inputs[tabName],
            groups: {
                basic: { label: '基本属性', index: 1 },
                advanced: { label: '高级属性', index: 2 }
            },
            operators: getCustomOperators()
        });

        inspector.render();
        tabContent.appendChild(inspector.el);
        inspectors[tabName] = inspector;
    });

    return inspectors;
}

/**
 * 获取自定义操作符
 * @returns {Object} 操作符对象
 */
function getCustomOperators() {
    return {
        kindequal: function (cell, value, prop, _valuePath) {
            const kindValue = cell.prop(_valuePath);
            return kindValue === prop;
        },
        notnull: function (cell, value, prop, _valuePath) {
            return value !== undefined && value !== null;
        }
    };
}

/**
 * 切换标签页
 * @param {string} tabName - 要显示的标签页ID
 */
export function openTab(tabName) {
    // 切换标签页内容显示
    const tabs = document.getElementsByClassName('inspector-tab');
    Array.from(tabs).forEach(tab => {
        tab.style.display = tab.id === tabName ? 'block' : 'none';
    });

    // 切换按钮样式
    const buttons = document.getElementsByClassName('inspector-tab-button');
    Array.from(buttons).forEach(button => {
        button.classList.toggle('active', button.dataset.inspector === tabName);
    });
}

/**
 * 显示端口的Inspector
 * @param {Object} element - 包含端口的元素
 * @param {string} portId - 端口ID
 * @param {HTMLElement} inspectorContainer - Inspector容器
 */
export function showPortInspector(element, portId, inspectorContainer) {
    if (!element || !portId) return;

    const port = element.getPort(portId);
    if (!port) return;

    // 创建临时模型供Inspector使用
    const tempModel = createPortTempModel(port);
    if (!tempModel) return;

    // 准备Inspector容器
    preparePortInspectorContainer(port, inspectorContainer);

    // 创建Inspector
    createInspector(tempModel, inspectorContainer);

    // 监听属性变更
    setupPortChangeListener(tempModel, element, portId);

    // 显示Inspector
    inspectorContainer.style.display = 'block';
}

/**
 * 为端口创建临时模型
 * @param {Object} port - 端口对象
 * @returns {Object} 临时JointJS模型
 */
function createPortTempModel(port) {
    const classType = port.properties.classType;
    if (classType !== 'InputPort' && classType !== 'OutputPort') return null;

    return new dia.Cell({
        id: `port-${port.id}`,
        type: classType,
        classType: classType,
        ...JSON.parse(JSON.stringify(port.properties))
    });
}

/**
 * 准备端口Inspector容器
 * @param {Object} port - 端口对象
 * @param {HTMLElement} container - Inspector容器
 */
function preparePortInspectorContainer(port, container) {
    // 清空容器
    container.innerHTML = '';

    // 添加标题
    const titleElem = document.createElement('div');
    titleElem.className = 'inspector-title';
    titleElem.textContent = `编辑端口: ${port.properties.name}`;
    container.appendChild(titleElem);
}

/**
 * 设置端口属性变更监听器
 * @param {Object} tempModel - 临时模型
 * @param {Object} element - 包含端口的元素
 * @param {string} portId - 端口ID
 */
function setupPortChangeListener(tempModel, element, portId) {
    tempModel.on('change', function (model, opt) {
        // 确保有有效的变更信息
        if (!opt || !opt.propertyPath || opt.propertyValue === undefined) return;

        // 更新端口属性
        element.portProp(portId, `properties/${opt.propertyPath}`, opt.propertyValue);

        // 处理特殊属性更新
        handleSpecialPortPropertyChange(element, portId, opt);
    });
}

/**
 * 处理端口特殊属性变更
 * @param {Object} element - 包含端口的元素
 * @param {string} portId - 端口ID
 * @param {Object} opt - 变更选项
 */
function handleSpecialPortPropertyChange(element, portId, opt) {
    const propertyPath = opt.propertyPath;
    const propertyValue = opt.propertyValue;

    if (propertyPath === 'name') {
        // 更新显示的标签
        element.portProp(portId, 'attrs/portLabel/text', propertyValue);
    } else if (propertyPath === 'kind') {
        // 更新端口颜色
        element.portProp(
            portId,
            'attrs/portBody/fill',
            portColors[propertyValue] || '#ff9580'
        );
    }
}

// Inspector配置对象
const inspectorConfigs = {
    'Component': {
        tabs: ['general'],
        inputs: {
            general: {
                name: {
                    type: "text",
                    group: "basic",
                    label: "Component Name"
                },
                namespace: {
                    type: "text",
                    group: "basic",
                    label: "Namespace(optional)"
                },
                kind: {
                    type: "select",
                    options: componentKindOptions,
                    group: "basic",
                    label: "Component Kind",
                    defaultValue: componentKindOptions[0].value
                },
                modeler: {
                    type: "toggle",
                    group: "advanced",
                    label: "Modeler(optional)",
                    defaultValue: false
                },
                comment: {
                    type: "textarea",
                    group: "basic",
                    label: "Comment"
                },
                specification: {
                    type: "textarea",
                    group: "advanced",
                    label: "LTL Specification"
                }
            }
        }
    },
    'Commands': {
        tabs: ['general', 'commands'],
        inputs: {
            general: {
                className: {
                    type: "text",
                    group: "basic",
                    label: "Class Name"
                },
                opcode_base: {
                    type: "text",
                    group: "basic",
                    label: "Base OpCode(optional)"
                }
            },
            commands: {
                commands: {
                    type: "list",
                    addButtonLabel: "Add Command",
                    item: {
                        type: "object",
                        properties: {
                            mnemonic: {
                                type: "text",
                                label: "Command Name",
                                index: 1,
                                defaultValue: "cmd"
                            },
                            kind: {
                                type: "select",
                                options: commandKindOptions,
                                label: "Command Kind",
                                index: 2,
                                defaultValue: commandKindOptions[0].value
                            },
                            opcode: {
                                type: "text",
                                label: "OpCode",
                                index: 3,
                                defaultValue: 0
                            },
                            priority: {
                                type: "number",
                                label: "Priority(ASYNC only)",
                                index: 4,
                                when: { eq: { 'commands/${index}/kind': CommandKind.ASYNC } },
                                defaultValue: 1
                            },
                            full: {
                                type: "select",
                                options: queueFullOptions,
                                label: "Queue Full Strategy(AYNC only, optional)",
                                index: 5,
                                when: { eq: { 'commands/${index}/kind': CommandKind.ASYNC } },
                                defaultValue: queueFullOptions[0].value
                            },
                            args: {
                                type: "list",
                                label: "Arguments",
                                index: 6,
                                item: {
                                    type: "object",
                                    properties: {
                                        name: {
                                            type: "text",
                                            label: "Argument Name",
                                            defaultValue: "arg"
                                        },
                                        type: {
                                            type: "select",
                                            options: fppTypeOptions,
                                            label: "Type",
                                            defaultValue: fppTypeOptions[0].value
                                        },
                                        size: {
                                            type: "number",
                                            label: "Size(string only)",
                                            when: { eq: { 'commands/${index}/args/${index}/type': 'string' } }, // string
                                            defaultValue: 20
                                        }
                                    }
                                }
                            },
                            comment: {
                                type: "textarea",
                                label: "Comment(optional)",
                                index: 7
                            }
                        }
                    }
                }
            }
        }
    },
    'Telemetry': {
        tabs: ['general', 'channels'],
        inputs: {
            general: {
                className: {
                    type: "text",
                    group: "basic",
                    label: "Class Name"
                },
                telemetry_base: {
                    type: "text",
                    group: "basic",
                    label: "Telemetry Base ID(optional)",
                }
            },
            channels: {
                channels: {
                    type: "list",
                    addButtonLabel: "Add Channel",
                    item: {
                        type: "object",
                        properties: {
                            name: {
                                type: "text",
                                label: "Channel Name",
                                index: 1,
                                defaultValue: "channel"
                            },
                            channel_id: {
                                type: "text",
                                label: "Channel ID",
                                index: 2,
                            },
                            data_type: {
                                type: "select",
                                options: fppTypeOptions,
                                label: "Data Type",
                                index: 3,
                                defaultValue: fppTypeOptions[0].value
                            },
                            size: {
                                type: "number",
                                label: "Size(string only)",
                                index: 4,
                                when: { eq: { 'channels/${index}/data_type': "string" } }, // string类型
                                defaultValue: 20
                            },
                            update_type: {
                                type: "select",
                                options: updateTypeOptions,
                                label: "Update Type",
                                index: 5,
                                defaultValue: updateTypeOptions[0].value
                            },
                            abbrev: {
                                type: "text",
                                label: "Abbreviation",
                                index: 6,
                                defaultValue: "ch"
                            },
                            comment: {
                                type: "textarea",
                                label: "Comment(optional)",
                                index: 7
                            }
                        }
                    }
                }
            }
        }
    },
    'Parameters': {
        tabs: ['general', 'parameters'],
        inputs: {
            general: {
                className: {
                    type: "text",
                    group: "basic",
                    label: "Class Name"
                },
                parameter_base: {
                    type: "text",
                    group: "basic",
                    label: "Parameter Base ID(optional)",
                },
                opcode_base: {
                    type: "text",
                    group: "basic",
                    label: "OpCode Base ID(optional)",
                }
            },
            parameters: {
                parameters: {
                    type: "list",
                    addButtonLabel: "Add Parameter",
                    item: {
                        type: "object",
                        properties: {
                            name: {
                                type: "text",
                                label: "Parameter Name",
                                index: 1,
                                defaultValue: "param"
                            },
                            parameter_id: {
                                type: "text",
                                label: "Parameter ID",
                                index: 2,
                            },
                            data_type: {
                                type: "select",
                                options: fppTypeOptions,
                                label: "Data Type",
                                index: 3,
                                defaultValue: fppTypeOptions[0].value
                            },
                            size: {
                                type: "number",
                                label: "Size(string only)",
                                index: 4,
                                when: { eq: { 'parameters/${index}/data_type': 'string' } }, // string类型
                                defaultValue: 20
                            },
                            default: {
                                type: "text",
                                label: "Default Value",
                                index: 5,
                                defaultValue: ""
                            },
                            set_opcode: {
                                type: "text",
                                label: "Set OpCode",
                                index: 6,
                            },
                            save_opcode: {
                                type: "text",
                                label: "Save OpCode",
                                index: 7,
                            },
                            comment: {
                                type: "textarea",
                                label: "Comment(optional)",
                                index: 8
                            }
                        }
                    }
                }
            }
        }
    },
    'Events': {
        tabs: ['general', 'events'],
        inputs: {
            general: {
                className: {
                    type: "text",
                    group: "basic",
                    label: "Class Name"
                }
            },
            events: {
                events: {
                    type: "list",
                    addButtonLabel: "Add Event",
                    item: {
                        type: "object",
                        properties: {
                            name: {
                                type: "text",
                                label: "Event Name",
                                index: 1,
                                defaultValue: "event"
                            },
                            event_id: {
                                type: "text",
                                label: "Event ID",
                                index: 2,
                                defaultValue: 0
                            },
                            severity: {
                                type: "select",
                                options: severityOptions,
                                label: "Severity",
                                index: 3,
                                defaultValue: severityOptions[0].value
                            },
                            format_string: {
                                type: "text",
                                label: "Format String",
                                index: 4,
                                defaultValue: ""
                            },
                            args: {
                                type: "list",
                                label: "Arguments",
                                index: 5,
                                item: {
                                    type: "object",
                                    properties: {
                                        name: {
                                            type: "text",
                                            label: "Argument Name",
                                            defaultValue: "arg"
                                        },
                                        type: {
                                            type: "select",
                                            options: fppTypeOptions,
                                            label: "Type",
                                            defaultValue: fppTypeOptions[0].value
                                        },
                                        size: {
                                            type: "number",
                                            label: "Size(string only)",
                                            when: { eq: { 'events/${index}/args/${index}/type': 'string' } }, // string
                                            defaultValue: 20
                                        }
                                    }
                                }
                            },
                            comment: {
                                type: "textarea",
                                label: "Comment(optional)",
                                index: 6
                            }
                        }
                    }
                }
            }
        }
    },
    'InputPort': {
        tabs: ['general', 'args', 'return'],
        inputs: {
            general: {
                name: {
                    type: "text",
                    group: "basic",
                    label: "Port Name"
                },
                kind: {
                    type: "select",
                    options: portKindOptions.slice(0, 3),
                    group: "basic",
                    label: "Port Kind"
                },
                namespace: {
                    type: "text",
                    group: "basic",
                    label: "Namespace"
                },
                priority: {
                    type: "number",
                    group: "advanced",
                    label: "Priority",
                    when: { eq: { kind: PortKind.ASYNC_INPUT } },
                },
                max_number: {
                    type: "number",
                    group: "advanced",
                    label: "Max Number"
                },
                full: {
                    type: "select",
                    options: queueFullOptions,
                    group: "advanced",
                    label: "Queue Full Behavior",
                    when: { eq: { kind: PortKind.ASYNC_INPUT } },
                    defaultValue: queueFullOptions[0].value
                },
                role: {
                    type: "text",
                    group: "advanced",
                    label: "Role"
                },
                comment: {
                    type: "textarea",
                    group: "basic",
                    label: "Description"
                }
            },
            args: {
                args: {
                    type: "list",
                    addButtonLabel: "Add Argument",
                    max: 5,
                    item: {
                        type: "object",
                        properties: {
                            name: {
                                type: "text",
                                label: "Argument Name",
                                index: 1,
                            },
                            type: {
                                type: "select",
                                options: fppTypeOptions,
                                label: "Type",
                                index: 2,
                            },
                            size: {
                                type: "number",
                                label: "Size (string only)",
                                index: 3,
                                when: { eq: { 'args/${index}/type': 'string' } }, // string类型索引
                                defaultValue: 20
                            },
                            pass_by: {
                                type: "select",
                                options: passByOptions,
                                label: "Pass By",
                                index: 4
                            }
                        }
                    }
                }
            },
            return: {
                "return": {
                    type: "object",
                    properties: {
                        type: {
                            type: "select",
                            options: [
                                { value: null, content: 'None (void)' },
                                ...fppTypeOptions
                            ],
                            label: "Return Type",
                        },
                        pass_by: {
                            type: "select",
                            options: passByOptions,
                            label: "Pass By",
                            when: { notnull: { 'return/type': null } },
                        }
                    }
                }
            }
        }
    },
    'OutputPort': {
        tabs: ['general', 'args', 'return'],
        inputs: {
            general: {
                name: {
                    type: "text",
                    group: "basic",
                    label: "Port Name"
                },
                kind: {
                    type: "select",
                    options: portKindOptions.slice(3),
                    group: "basic",
                    label: "Port Kind"
                },
                namespace: {
                    type: "text",
                    group: "basic",
                    label: "Namespace"
                },
                max_number: {
                    type: "number",
                    group: "advanced",
                    label: "Max Number"
                },
                role: {
                    type: "text",
                    group: "advanced",
                    label: "Role"
                },
                comment: {
                    type: "textarea",
                    group: "basic",
                    label: "Description"
                }
            },
            args: {
                args: {
                    type: "list",
                    addButtonLabel: "Add Argument",
                    max: 5,
                    item: {
                        type: "object",
                        properties: {
                            name: {
                                type: "text",
                                label: "Argument Name",
                                index: 1,
                            },
                            type: {
                                type: "select",
                                options: fppTypeOptions,
                                label: "Type",
                                index: 2,
                            },
                            size: {
                                type: "number",
                                label: "Size (string only)",
                                index: 3,
                                when: { eq: { 'args/${index}/type': 'string' } }, // string类型索引
                                defaultValue: 20
                            },
                            pass_by: {
                                type: "select",
                                options: passByOptions,
                                label: "Pass By",
                                index: 4
                            }
                        }
                    }
                }
            },
            return: {
                "return": {
                    type: "object",
                    properties: {
                        type: {
                            type: "select",
                            options: [
                                { value: null, content: 'None (void)' },
                                ...fppTypeOptions
                            ],
                            label: "Return Type",
                        },
                        pass_by: {
                            type: "select",
                            options: passByOptions,
                            label: "Pass By",
                            when: { notnull: { 'return/type': null } },
                        }
                    }
                }
            }
        }
    }
};