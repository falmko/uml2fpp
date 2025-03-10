import { dia, shapes, ui, format, util } from '@joint/plus';
import { UMLClass } from './shapes';
import { CommandKind, QueueFull } from '../models/command';
import { fppTypeOptions } from './telemetry';

// 创建命令类型选项
/**
 * commandKindOptions常量
 * 定义了命令类型的选项
 */
export const commandKindOptions = Object.entries(CommandKind).map(([key, value]) => ({
    value: key,
    content: value
}));

// 创建队列满处理选项
/**
 * queueFullOptions常量
 * 定义了队列满时的处理选项
 */
export const queueFullOptions = Object.entries(QueueFull).map(([key, value]) => ({
    value: key,
    content: value
}));

/**
 * Commands类
 * 代表系统中的一组命令，包含命令的基本属性、命令列表等信息
 */
export class Commands extends UMLClass {
    defaults() {
        return {
            ...super.defaults(),
            type: "Commands",
            color: "#E8F5E9",         // 浅绿色背景
            headerColor: "#C8E6C9",   // 深一点的绿色表头
            outlineColor: "#43A047",  // 绿色边框
            textColor: "#1B5E20",     // 深绿色文字
            size: { width: 400, height: 0 },
            itemHeight: 25,
            padding: { top: 40, left: 10, right: 10, bottom: 10 },
            commands: [],  // Command 数组
            opcode_base: undefined,
            classType: "Commands",
            className: "",
            parent_id: "",
        };
    }

    buildItems(opt = {}) {
        const thickness = 2;
        const {
            color,
            outlineColor,
            textColor,
            headerColor,
            classType = "Commands",
            className = "",
            parent_id = "",
            commands = [],
            opcode_base
        } = this.attributes;


        // 将 commands 转换为显示项
        const commandItems = commands.map((command,index) => {
            const {
                mnemonic = "",
                opcode,
                kind = CommandKind.SYNC,  // 默认为同步命令
                priority = 1,
                full = QueueFull.ASSERT, // 默认为断言
                args = []
            } = command;

            // 构建参数字符串
            const argsString = args.length > 0
                ? `(${args.map((arg, index) => {
                    return `${arg.name}: ${arg.type}`;
                }).join(', ')})`
                : '()';

            // 构建标签，包含优先级和队列满处理策略（如果适用）
            let label = `${mnemonic}${argsString}: ${kind}`;
            if (kind === CommandKind.ASYNC) {
                label += ` [${priority}, ${full}]`;
            }

            return {
                id: `cmd_${mnemonic}_${index}`,
                label,
                icon: this.getVisibilityIcon('+', textColor),
                mnemonic,
                opcode,
                kind,
                priority,
                full,
                args
            };
        });

        if (commandItems.length === 0) {
            commandItems.push({
                id: 'cmd_empty',
                label: 'No commands',
                icon: this.getVisibilityIcon('+', textColor)
            });
        }

        let headerHeight = 30;
        let headerText = className;

        let items = [];
        // 如果有opcode_base，显示
        if (opcode_base !== undefined&&opcode_base!== "") {
            items.push({
                id: 'opcode_base',
                label: `Base OpCode: ${opcode_base}`,
                icon: this.getVisibilityIcon('~', textColor)
            });
            // 添加分隔符
            items.push({
                id: "delimiter",
                height: thickness,
                label: ""
            });
        }
        // 添加所有命令项
        items.push(...commandItems);

        if (classType) {
            headerText = `<<${classType}>>\n${headerText}`;
            headerHeight *= 2;
        }

        this.set({
            padding: { top: headerHeight },
            attrs: util.defaultsDeep({
                body: {
                    stroke: outlineColor,
                    strokeWidth: thickness,
                    fill: color
                },
                header: {
                    stroke: outlineColor,
                    strokeWidth: thickness,
                    height: headerHeight,
                    fill: headerColor
                },
                headerLabel: {
                    text: headerText,
                    textWrap: {
                        height: headerHeight,
                        width: "calc(w-10)",
                        preserveSpaces: true,
                        ellipsis: true
                    },
                    fontFamily: "sans-serif",
                    refY: null,
                    y: headerHeight / 2,
                    lineHeight: 30,
                    fill: textColor
                },
                itemLabels: {
                    fontFamily: "sans-serif",
                    fill: textColor
                },
                itemBody_delimiter: {
                    fill: outlineColor
                }
            }, this.attr()),
            items: [items]
        }, opt);
    }

    getProperties() {
        const {
            opcode_base,
            commands = []
        } = this.attributes;


        return {
            opcode_base,
            commands
        };
    }
}
