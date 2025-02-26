import { dia, shapes, ui, format, util } from "@joint/plus";
import { PassBy } from '../types/arg';
import { fppTypeOptions } from './telemetry';
import { PortKind } from "../models/port";

// 定义PassBy选项
export const passByOptions = Object.values(PassBy).map((value, index) => ({
    value: index,
    content: value
}));

// 将端口类型转换为选项
export const portKindOptions = Object.entries(PortKind).map(([key, value]) => ({
    value: value, 
    content: key
}));

export class InputPort extends shapes.standard.Rectangle{}
// 输入端口 三角形
export class OutputPort extends shapes.standard.Polygon {
    constructor(options) {
        super({
            ...options,
            body: {
                points: [
                    { x: -12, y: -12 },
                    { x: 12, y: -12 },
                    { x: 0, y: 10 }
                ]
            }
        });
    }
}