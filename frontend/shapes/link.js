import {
    shapes,
    util,
} from '@joint/plus';

export class Dependency extends shapes.standard.Link {
    defaults() {
        return util.defaultsDeep(
            {
                type: "Dependency",
                attrs: {
                    root: {
                        pointerEvents: "none"
                    },
                    line: {
                        stroke: "#131e29",
                        strokeWidth: 2,
                        strokeDasharray: "10,5",
                        targetMarker: {
                            type: "path",
                            fill: "#131e29",
                            stroke: "#131e29",
                            "stroke-width": 2,
                            d: "M 0 0 L 10 5 L 10 -5 z"
                        }
                    }
                }
            },
            super.defaults
        );
    }
}