import { dia, shapes, ui, format, util } from '@joint/plus';
import { UMLClass } from './shapes';
import {ComponentKind} from '../models/component';

export const componentKindOptions = Object.entries(ComponentKind).map(([key, value]) => ({
    value: key,
    content: value
}));

export class ComponentBase extends UMLClass {
    defaults() {
        return {
            ...super.defaults(),
            type: "Component",
            size: { width: 300},
            outlineColor: "#ff9580",
            color: "#ffeae5",
            headerColor: "#ffd4cc",
            textColor: "#002b33",
            itemHeight: 25,
            padding: { top: 40, left: 10, right: 10, bottom: 10 },

            /* 组件属性 */
            classType: "Component",
            className: "",
            name: "",        // 组件名称
            namespace: "",   // C++ 命名空间 optional
            kind: componentKindOptions[0].content,       // 组件类型 active by default
            modeler: false,  // 建模器标志
            comment: "",
            specification: "",
        };
    }

    buildItems(opt = {}) {
        const thickness = 2;
        const {
            color,
            outlineColor,
            textColor,
            headerColor,

            classType = "Component",
            className = "",
            name = "",
            namespace = "",
            kind = componentKindOptions[0].content,
            modeler = false,
            comment = "",
            specification = ""
        } = this.attributes;

        // 构建组件属性项
        const propertyItems = [];
        propertyItems.push(
            {
                id: 'kind',
                label: `kind: ${kind}`,
                icon: this.getVisibilityIcon('+', textColor)
            }
        );

        let headerHeight = 30;
        // 构建名称，如果有 namespace 则使用 namespace::name 格式
        const displayName = namespace ? `${namespace}::${name}` : name;
        // 设置表头文本
        let headerText = `<<${classType}>>\n${displayName}`;
        headerHeight *= 2;

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
                ...propertyItems,
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
            name = "",
            namespace = "",
            kind = componentKindOptions[0].content,
            modeler = false,
            comment = "",
            specification = ""
        } = this.attributes;

        return {
            name,
            namespace,
            kind,
            modeler,
            comment,
            specification
        };
    }
}