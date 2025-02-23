import { dia, shapes, ui, format, util } from '@joint/plus';
export const typeOptions = [
    {
        value: 0,
        content: "bool"
    },
    {
        value: 1,
        content: "currency"
    },
    {
        value: 2,
        content: "float"
    },
    {
        value: 3,
        content: "int"
    },
    {
        value: 4,
        content: "void"
    },
    {
        value: 5,
        content: "point"
    },
    {
        value: 6,
        content: "this"
    }
];

export class UMLClass extends shapes.standard.HeaderedRecord {
    defaults() {
        return {
            ...super.defaults,
            type: "UMLClass",
            color: "#ffffff",
            outlineColor: "#333333",
            textColor: "#333333",
            headerColor: "#ffffff",
            size: { width: 300, height: 0 },
            itemOffset: 5,
            className: "",
            classType: ""
        };
    }

    initialize(...args) {
        super.initialize(...args);
        this.on("change", (cell, opt) => this.buildItems(opt));
        this.buildItems();
    }

    buildItems(opt = {}) {
        const thickness = 2;
        const {
            className = "",
            classType = "",
            color,
            outlineColor,
            textColor,
            headerColor,
            attributes = [],
            operations = []
        } = this.attributes;

        const buildTypeOptions = [...typeOptions, { value: 7, content: className }];

        const attributesItems = attributes.map((attribute, index) => {
            const {
                visibility = "+",
                name = "",
                returnType = 0,
                isStatic = false
            } = attribute;

            return {
                id: `attribute${index}`,
                label: `${name}: ${buildTypeOptions[returnType].content}`,
                icon: this.getVisibilityIcon(visibility, textColor),
                group: isStatic ? "static" : null
            };
        });
        if (attributesItems.length === 0) {
            attributesItems.push({
                id: "no_attributes"
            });
        }

        const operationsItems = operations.map((operation, index) => {
            const {
                visibility = "+",
                name = "",
                returnType = 0,
                parameters = [],
                isStatic = false
            } = operation;

            const nameParams = parameters
                ? parameters.map((parameter) => {
                    const { name = "", type = 0 } = parameter;
                    return `${name}: ${buildTypeOptions[type].content}`;
                })
                : [];

            return {
                id: `operation${index}`,
                label: `${name}(${nameParams.join(",")}): ${buildTypeOptions[returnType].content
                    }`,
                icon: this.getVisibilityIcon(visibility, textColor),
                group: isStatic ? "static" : null
            };
        });
        if (operationsItems.length === 0) {
            operationsItems.push({
                id: "no_operations"
            });
        }

        let headerHeight = 30;
        let headerText = className;

        if (classType) {
            headerText = `<<${classType}>>\n${headerText}`;
            headerHeight *= 2;
        }

        this.set(
            {
                padding: { top: headerHeight },
                typeOptions: buildTypeOptions,
                attrs: util.defaultsDeep(
                    {
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
                        itemLabels_static: {
                            textDecoration: "underline"
                        },
                        itemBody_delimiter: {
                            fill: outlineColor
                        }
                    },
                    this.attr()
                ),
                items: [
                    [
                        ...attributesItems,
                        {
                            id: "delimiter",
                            height: thickness,
                            label: ""
                        },
                        ...operationsItems
                    ]
                ]
            },
            opt
        );
    }

    getVisibilityIcon(visibility, color) {
        const d = {
            "+": "M 8 0 V 16 M 0 8 H 16",
            "-": "M 0 8 H 16",
            "#": "M 5 0 3 16 M 0 5 H 16 M 12 0 10 16 M 0 11 H 16",
            "~": "M 0 8 A 4 4 1 1 1 8 8 A 4 4 1 1 0 16 8",
            "/": "M 12 0 L 4 16"
        }[visibility];
        return `data:image/svg+xml;utf8,${encodeURIComponent(`<svg
                  xmlns="http://www.w3.org/2000/svg"
                  xmlns:xlink="http://www.w3.org/1999/xlink"
                  version="1.1"
                  viewBox="-3 -3 22 22"
              >
                  <path d="${d}" stroke="${color}" stroke-width="2" fill="none"/>
              </svg>`)}`;
    }
}

