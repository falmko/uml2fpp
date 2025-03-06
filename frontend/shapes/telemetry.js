import { dia, shapes, ui, format, util } from '@joint/plus';
import { UMLClass } from './shapes';
import {FppPrimitiveTypes} from '../types/types';
import { UpdateType } from '../models/telemetry';

export const updateTypeOptions = Object.entries(UpdateType).map(([key, value]) => ({
    value: key, 
    content: value
}));
// 动态从 FppPrimitiveTypes 生成选项
export const fppTypeOptions = FppPrimitiveTypes.map((type, index) => ({
    value: type,  // 使用索引作为值，或者使用type本身
    content: type
}));

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
            
            /* 遥测属性 */
            telemetry_base: undefined,
            channels: [],
            classType: "Telemetry",
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
            classType = "Telemetry",
            className = "",
            telemetry_base = "",
            channels = []
        } = this.attributes;

        // 修改 channelItems 的构建方式
        const channelItems = channels.map((channel,index) => {
            const {
                visibility = "+",
                name = "",
                channel_id = "",
                data_type = 0,
                size = 20,
                update_type = 0,
                abbrev = "",
                // format_string = "",
                comment = ""
            } = channel;

            return {
                id: `channel_${index}`,
                label: `${name}: ${data_type}`,
                icon: this.getVisibilityIcon(visibility, textColor),
                name,
                channel_id,
                data_type,
                size,
                update_type,
                abbrev,
                // format_string,
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

    getProperties() {
        const {
            telemetry_base = 0,
            channels = []
        } = this.attributes;

        // 转换通道列表，添加可读的类型名称
        const convertedChannels = channels.map(channel => ({
            ...channel,
            // 添加数据类型的可读名称
            data_type_name: fppTypeOptions[channel.data_type]?.content || 'unknown',
            // 添加更新类型的可读名称
            update_type_name: updateTypeOptions[channel.update_type]?.content || 'unknown',
            // 保留原始值
            data_type: channel.data_type,
            update_type: channel.update_type
        }));

        return {
            telemetry_base,
            channels: convertedChannels
        };
    }
}

