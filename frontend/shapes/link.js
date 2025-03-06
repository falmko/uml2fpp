import {
  shapes,
  util,
} from '@joint/plus';

const COLORS = {
  header: "#f68e96",
  text: "#131e29",
  outline: "#131e29",
  main: "#fdecee",
  background: "#d7e2ea",
  grid: "#a1bbce",
  tools: "#fdecee"
};
class UMLLink extends shapes.standard.Link {
  defaults() {
    return util.defaultsDeep(
      {
        type: "UMLLink",
        attrs: {
          root: {
            pointerEvents: "none"
          },
          line: {
            stroke: COLORS.outlineColor,
            targetMarker: {
              type: "path",
              fill: "none",
              stroke: COLORS.outlineColor,
              "stroke-width": 2,
              d: "M 7 -4 0 0 7 4"
            }
          }
        }
      },
      super.defaults
    );
  }
}

export class Composition extends UMLLink {
  defaults() {
    return util.defaultsDeep(
      {
        type: "Composition",
        attrs: {
          line: {
            sourceMarker: {
              type: "path",
              fill: COLORS.outlineColor,
              "stroke-width": 2,
              d: "M 10 -4 0 0 10 4 20 0 z"
            }
          }
        }
      },
      super.defaults()
    );
  }
}