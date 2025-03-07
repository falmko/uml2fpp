import { dia, shapes, ui, format, util } from '@joint/plus';
import { ComponentBase } from './compoent_base';
import { defaultPortsConfig } from '../port_move_tool/port_move_tool';

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
    // 配置参数
    const columnWidth = 260;   // 组件宽度
    const componentHeight = 50; // 组件高度
    const horizontalSpacing = 10; // 列间距
    const verticalSpacing = 20;   // 行间距
    
    // 定义组件配置
    const componentConfigs = [
        // 第一列组件（左侧）
        { name: "Control", column: 0, row: 0 },
        { name: "Collect", column: 0, row: 1 },
        { name: "Process", column: 0, row: 2 },
        { name: "Core", column: 0, row: 3 },
        
        // 第二列组件（右侧）
        { name: "Start", column: 1, row: 0 },
        { name: "Diagnose", column: 1, row: 1 },
        { name: "Execution", column: 1, row: 2 },
        { name: "Calculate", column: 1, row: 3 },
    ];
    
    // 创建组件辅助函数
    function createComponent(config) {
        const { name, column, row } = config;
        const xOffset = column === 0 
            ? -columnWidth/2 - horizontalSpacing/2  // 左列
            : columnWidth/2 + horizontalSpacing/2;  // 右列
            
        return new FprimeArchitectureComponent({
            position: { 
                x: position.x + xOffset, 
                y: position.y + row * (componentHeight + verticalSpacing) 
            },
            size: { width: columnWidth, height: componentHeight },
            name,
            isArchitectureComponent: true,
        });
    }
    
    // 批量创建组件
    const components = componentConfigs.map(createComponent);
    
    // 为所有组件添加端口配置
    components.forEach((component) => {
        component.set('ports', defaultPortsConfig);
    });

    return components;
}