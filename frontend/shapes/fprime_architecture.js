import { dia, shapes, ui, format, util } from '@joint/plus';

import { ComponentBase } from './compoent_base';

export class FprimeArchitectureComponent extends ComponentBase {
    defaults() {
        return {
            ...super.defaults(),
            type: "FprimeArchitecture",
            size: { width: 260 },
            outlineColor: "#707070",
            color: "#f0f0f0",
            headerColor: "#d0d0d0",
            textColor: "#303030",
            itemHeight: 25,
            padding: { top: 40, left: 10, right: 10, bottom: 10 },

            /* 组件属性 */
            classType: "FprimeArchitecture",
            className: "FprimeArchitectureComponent",
            name: "Component",        // 组件名称
        };
    }
    buildItems(opt = {}) {
        const thickness = 2;
        const {
            color,
            outlineColor,
            textColor,
            headerColor,

            classType = "FprimeArchitecture",
            className = "FprimeArchitectureComponent",
            name = "Component",
        } = this.attributes;

        let headerHeight = 30;
        const headerText = `<<${classType}>>\n${name}`;
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
        }, opt);
    }
}

export function createFprimeArchitectureLayout(position) {
    const components = [];

    // Create components in a two-column layout
    const columnWidth = 260; // Component width
    const componentHeight = 50; // Component height
    const horizontalSpacing = 10; // Space between columns
    const verticalSpacing = 20; // Space between rows

    // First column components (left side)
    const controlComponent = new FprimeArchitectureComponent({
        position: { x: position.x - columnWidth/2 - horizontalSpacing/2, y: position.y },
        size: { width: columnWidth, height: componentHeight },
        name: "Control",
        isArchitectureComponent: true,
    });
    components.push(controlComponent);

    const collectComponent = new FprimeArchitectureComponent({
        position: { x: position.x - columnWidth/2 - horizontalSpacing/2, y: position.y + (componentHeight + verticalSpacing) },
        size: { width: columnWidth, height: componentHeight },
        name: "Collect",
        isArchitectureComponent: true,
    });
    components.push(collectComponent);

    const processComponent = new FprimeArchitectureComponent({
        position: { x: position.x - columnWidth/2 - horizontalSpacing/2, y: position.y + 2 * (componentHeight + verticalSpacing) },
        size: { width: columnWidth, height: componentHeight },
        name: "Process",
        isArchitectureComponent: true,
    });
    components.push(processComponent);

    const coreComponent = new FprimeArchitectureComponent({
        position: { x: position.x - columnWidth/2 - horizontalSpacing/2, y: position.y + 3 * (componentHeight + verticalSpacing) },
        size: { width: columnWidth, height: componentHeight },
        name: "Core",
        isArchitectureComponent: true,
    });
    components.push(coreComponent);

    // Second column components (right side)
    const startComponent = new FprimeArchitectureComponent({
        position: { x: position.x + columnWidth/2 + horizontalSpacing/2, y: position.y },
        size: { width: columnWidth, height: componentHeight },
        name: "Start",
        isArchitectureComponent: true,
    });
    components.push(startComponent);

    const diagnoseComponent = new FprimeArchitectureComponent({
        position: { x: position.x + columnWidth/2 + horizontalSpacing/2, y: position.y + (componentHeight + verticalSpacing) },
        size: { width: columnWidth, height: componentHeight },
        name: "Diagnose",
        isArchitectureComponent: true,
    });
    components.push(diagnoseComponent);

    const executionComponent = new FprimeArchitectureComponent({
        position: { x: position.x + columnWidth/2 + horizontalSpacing/2, y: position.y + 2 * (componentHeight + verticalSpacing) },
        size: { width: columnWidth, height: componentHeight },
        name: "Execution",
        isArchitectureComponent: true,
    });
    components.push(executionComponent);

    const calculateComponent = new FprimeArchitectureComponent({
        position: { x: position.x + columnWidth/2 + horizontalSpacing/2, y: position.y + 3 * (componentHeight + verticalSpacing) },
        size: { width: columnWidth, height: componentHeight },
        name: "Calculate",
        isArchitectureComponent: true,
    });
    components.push(calculateComponent);

    components.forEach((component) => {
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
    });

    // 返回创建的组件
    return components;
}