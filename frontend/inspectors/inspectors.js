import { ui } from '@joint/plus';
import { componentKindOptions } from '../shapes/compoent_base';
import { commandKindOptions, queueFullOptions } from '../shapes/commands';
import { fppTypeOptions,updateTypeOptions } from '../shapes/telemetry';
import { CommandKind} from '../models/command';
import { severityOptions } from '../shapes/events';
import { portKindOptions } from '../shapes/port';
import { PortKind } from '../models/port';
import { passByOptions } from '../shapes/port';
import { PassBy } from '../types/arg';

// Inspector配置对象
export const inspectorConfigs = {
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
                    group: "basic",
                    label: "Modeler",
                    defaultValue: true
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
                    type: "number",
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
                                type: "number",
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
                                            when: { eq: { 'commands/${index}/args/${index}/type': '11' }}, // string
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
                    type: "number",
                    group: "basic",
                    label: "Telemetry Base ID(optional)",
                    defaultValue: 0
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
                            id: {
                                type: "number",
                                label: "Channel ID",
                                index: 2,
                                defaultValue: 0
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
                                when: { eq: { 'channels/${index}/data_type': 11 }}, // string类型
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
                            format_string: {
                                type: "text",
                                label: "Format String(optional)",
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
                    type: "number",
                    group: "basic",
                    label: "Parameter Base ID(optional)",
                },
                opcode_base: {
                    type: "number",
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
                            id: {
                                type: "number",
                                label: "Parameter ID",
                                index: 2,
                                defaultValue: 0
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
                                when: { eq: { 'parameters/${index}/data_type': 11 }}, // string类型
                                defaultValue: 20
                            },
                            default: {
                                type: "text",
                                label: "Default Value",
                                index: 5,
                                defaultValue: ""
                            },
                            set_opcode: {
                                type: "number",
                                label: "Set OpCode",
                                index: 6,
                                defaultValue: 0
                            },
                            save_opcode: {
                                type: "number",
                                label: "Save OpCode",
                                index: 7,
                                defaultValue: 0
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
                            id: {
                                type: "number",
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
                                            when: { eq: { 'events/${index}/args/${index}/type': '11' }}, // string
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
                                when: { eq: { 'args/${index}/type': 11 }}, // string类型索引
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
                            when: { notnull: { 'return/type': null }  },
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
                                when: { eq: { 'args/${index}/type': 11 }}, // string类型索引
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
                            when: { notnull: { 'return/type': null }  },
                        }
                    }
                }
            }
        }
    }
};

// Inspector创建函数
export function createInspector(cell) {
    if (!cell) return null;
    console.log("cell ",cell);

    const classType = cell.get('classType') || cell.get('type');
    console.log("classType ",cell.get('classType'));
    console.log("type ",cell.get('type'));
    const config = inspectorConfigs[classType];
    if (!config) return null;

    const inspectorContainer = document.getElementById('inspector');
    inspectorContainer.innerHTML = '';

    // 创建tab按钮
    const tabButtons = document.createElement('div');
    tabButtons.className = 'inspector-tabs';
    config.tabs.forEach(tabName => {
        const button = document.createElement('button');
        button.className = 'inspector-tab-button';
        button.dataset.inspector = `inspector-${tabName}`;
        button.textContent = tabName.charAt(0).toUpperCase() + tabName.slice(1);
        tabButtons.appendChild(button);
    });
    inspectorContainer.appendChild(tabButtons);

    // 创建tab内容
    const inspectors = {};
    config.tabs.forEach(tabName => {
        const tabContent = document.createElement('div');
        tabContent.id = `inspector-${tabName}`;
        tabContent.className = 'inspector-tab';
        inspectorContainer.appendChild(tabContent);

        const inspector = new ui.Inspector({
            cell: cell,
            inputs: config.inputs[tabName],
            groups: {
                basic: { label: '基本属性', index: 1 },
                advanced: { label: '高级属性', index: 2, closed: true }
            },
            operators: {
                kindequal: function (cell, value, prop, _valuePath) {
                    console.log('kindequal', value, prop);
                    
                    // 这里获取当前cell中的kind属性值
                    const kindValue = cell.prop(_valuePath);
                    
                    // 检查kind是否等于我们期望的值（在这里是"ASYNC"）
                    return kindValue === prop;
                },
                notnull: function (cell, value, prop, _valuePath) {

                    if (value === undefined||value === null) {
                        return false
                    }
                    return true;
                }
            }
        });
        inspector.render();
        tabContent.appendChild(inspector.el);
        inspectors[tabName] = inspector;
    });

    inspectorContainer.style.display = 'block';
    openTab(`inspector-${config.tabs[0]}`);

    return inspectors;
}

// Tab切换函数
export function openTab(tabName) {
    const tabs = document.getElementsByClassName('inspector-tab');
    for (let tab of tabs) {
        tab.style.display = tab.id === tabName ? 'block' : 'none';
    }

    const buttons = document.getElementsByClassName('inspector-tab-button');
    for (let button of buttons) {
        button.classList.toggle('active', button.dataset.inspector === tabName);
    }
}