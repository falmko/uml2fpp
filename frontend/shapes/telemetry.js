import { dia, shapes, ui, format, util } from '@joint/plus';
import { UMLClass } from './shapes';

export const updateTypeOptions = [
    { value: 0, content: "always" },
    { value: 1, content: "on_change" }
];

export const fppTypeOptions = [
    { value: 0, content: "U8" },
    { value: 1, content: "I8" },
    { value: 2, content: "U16" },
    { value: 3, content: "I16" },
    { value: 4, content: "U32" },
    { value: 5, content: "I32" },
    { value: 6, content: "U64" },
    { value: 7, content: "I64" },
    { value: 8, content: "F32" },
    { value: 9, content: "F64" },
    { value: 10, content: "bool" },
    { value: 11, content: "string" }
];

export class Telemetry extends UMLClass {
    defaults() {
        return {
            ...super.defaults(),
            type: "Telemetry",
            color: "#E1F5FE",
            headerColor: "#B3E5FC",
            outlineColor: "#0288D1",
            textColor: "#01579B",
            size: { width: 300, height: 0 },
            itemHeight: 25, // 添加这行
            padding: { top: 40, left: 10, right: 10, bottom: 10 }, // 添加这行
            telemetry_base: 0,
            channels: [],
            classType: "telemetry",
            className: ""
        };
    }

    buildItems(opt = {}) {
        const thickness = 2;
        const {
            color,
            outlineColor,
            textColor,
            headerColor,
            classType = "telemetry",
            className = "",
            telemetry_base = 0,
            channels = []
        } = this.attributes;

        // 修改 channelItems 的构建方式
        const channelItems = channels.map((channel) => {
            const {
                visibility = "+",
                id = 0,
                name = "",
                data_type = 0,
                size = 0,
                update_type = 0,
                abbrev = "",
                format_string = "",
                comment = ""
            } = channel;

            return {
                id: `channel_${id}`,
                label: `${name}: ${fppTypeOptions[data_type].content}`,
                icon: this.getVisibilityIcon(visibility, textColor),
                name,
                data_type,
                size,
                update_type,
                abbrev,
                format_string,
                comment
            };
        });

        if (channelItems.length === 0) {
            channelItems.push({
                id: 'channel_empty',
                label: 'No channels',
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
                ...channelItems,
                {
                    id: "delimiter",
                    height: thickness,
                    label: ""
                }
            ]]
        }, opt);
    }
}

