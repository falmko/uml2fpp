import { dia, shapes, ui, format, util } from '@joint/plus';
import { UMLClass } from './shapes';
import { fppTypeOptions } from './telemetry';

export class Parameters extends UMLClass {
    defaults() {
        return {
            ...super.defaults(),
            type: "Parameters",
            color: "#E0F7FA",
            headerColor: "#B2EBF2",
            outlineColor: "#00ACC1",
            textColor: "#006064",
            size: { width: 300, height: 0 },
            itemHeight: 25,
            padding: { top: 40, left: 10, right: 10, bottom: 10 },

            /* 参数属性 */
            parameter_base: 0,
            opcode_base: 0,
            parameters: [],
            classType: "Parameters",
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
            classType = "Parameters",
            className = "",

            parameter_base = 0,
            opcode_base = 0,
            parameters = []
        } = this.attributes;

        // 构建参数项
        const parameterItems = parameters.map((parameter) => {
            const {
                id = 0,
                name = "",
                data_type = 0,
                size = 0,
                default: defaultValue = "",
                comment = "",
                set_opcode = 0,
                save_opcode = 0
            } = parameter;

            return {
                id: `parameter_${id}`,
                label: `${name}: ${fppTypeOptions[data_type].content}`,
                icon: this.getVisibilityIcon('+', textColor),
                name,
                data_type,
                size,
                default: defaultValue,
                comment,
                set_opcode,
                save_opcode
            };
        });

        if (parameterItems.length === 0) {
            parameterItems.push({
                id: 'parameter_empty',
                label: 'No parameters',
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
                ...parameterItems,
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
            parameter_base = 0,
            opcode_base = 0,
            parameters = []
        } = this.attributes;

        // 转换参数列表，将 data_type 数字转换为具体类型名称
        const convertedParameters = parameters.map(param => ({
            ...param,
            data_type_name: fppTypeOptions[param.data_type]?.content || 'unknown',
            // 保留原始的 data_type 数值
            data_type: param.data_type
        }));

        return {
            parameter_base,
            opcode_base,
            parameters: convertedParameters
        };
    }
}