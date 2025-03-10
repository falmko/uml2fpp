import { dia, shapes, ui, format, util } from '@joint/plus';
import { UMLClass } from './shapes';
import { Severity } from '../models/event';
import { fppTypeOptions } from './telemetry';

/**
 * severityOptions常量
 * 定义了事件严重程度的选项
 */
export const severityOptions = Object.entries(Severity).map(([key, value]) => ({
    value: key,
    content: value
}));

/**
 * Events类
 * 代表系统中的一组事件，包含事件的基本属性、事件列表等信息
 */
export class Events extends UMLClass {
    defaults() {
        return {
            ...super.defaults(),
            type: "Events",
            color: "#F3E5F5",  // 浅紫色背景
            headerColor: "#E1BEE7",  // 深紫色头部
            outlineColor: "#7B1FA2",  // 紫色边框
            textColor: "#4A148C",  // 深紫色文字
            size: { width: 300, height: 0 },
            itemHeight: 25,
            padding: { top: 40, left: 10, right: 10, bottom: 10 },
            events: [],  // Event 数组
            classType: "Events",
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
            classType = "Events",
            className = "",
            parent_id = "",
            events = []
        } = this.attributes;

        // 将 events 转换为显示项
        const eventItems = events.map((event,index) => {
            const {
                name = "",
                event_id = "",
                severity = Severity.DIAGNOSTIC,
                format_string = "",
                args = []
            } = event;

            // 构建参数字符串
            const argsString = args.length > 0 
                ? `(${args.map(arg => `${arg.name}: ${arg.type}`).join(', ')})`
                : '()';

            return {
                id: `event_${index}`,
                label: `${name}${argsString}: ${severity}`,
                icon: this.getVisibilityIcon('+', textColor),
                name,
                event_id,
                severity,
                format_string,
                args
            };
        });

        if (eventItems.length === 0) {
            eventItems.push({
                id: 'event_empty',
                label: 'No events',
                icon: this.getVisibilityIcon('+', textColor)
            });
        }

        let headerHeight = 30;
        let headerText = className;

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
            items: [[
                ...eventItems,
                {
                    id: "delimiter",
                    height: thickness,
                    label: ""
                }
            ]]
        }, opt);
    }

    getProperties() {
        const {
            events = []
        } = this.attributes;


        return {
            events
        };
    }
}
