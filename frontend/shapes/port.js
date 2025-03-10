import { shapes } from "@joint/plus";
import { PassBy } from '../types/arg';
import { PortKind } from "../models/port";

// 定义PassBy选项
export const passByOptions = Object.entries(PassBy).map(([key, value]) => ({
    value: value,
    content: key
}));

// 将端口类型转换为选项
export const portKindOptions = Object.entries(PortKind).map(([key, value]) => ({
    value: value,
    content: key
}));

/**
 * 生成唯一的端口ID
 * @returns {string} 生成的端口ID
 */
export function generatePortId() {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 6);
    return `P-${timestamp}-${random}`;
}

/**
 * 创建默认的端口属性
 * @returns {Object} 默认的端口属性对象
 */
export function createDefaultPortProps() {
    return {
        name: generatePortId(),      // 端口名称
        kind: "SYNC_INPUT",          // 端口类型（同步/异步输入、输出）
        namespace: "",               // C++命名空间（可选）
        priority: null,              // 异步端口的优先级（可选）
        max_number: null,            // 此类型端口的最大数量（可选）
        full: "ASSERT",              // 异步端口队列满时的行为（可选）
        role: "",                    // 建模时的端口角色（可选）
        comment: "",                 // 端口描述注释
        args: [],                    // 端口参数列表
        return: null,                // 返回值类型（可选）
    };
}

/**
 * 端口颜色常量
 * 定义了不同类型端口的颜色
 */
export const portColors = {
    'SYNC_INPUT': '#ff9580',     // 同步输入端口为红色
    'GUARDED_INPUT': '#ffc880',  // 保护输入端口为橙色
    'ASYNC_INPUT': '#ffff80',    // 异步输入端口为黄色
    'OUTPUT': '#80ff95'          // 输出端口为绿色
};

/**
 * InputPort类
 * 代表输入端口，继承自JointJS的Rectangle形状
 */
export class InputPort extends shapes.standard.Rectangle { }

/**
 * OutputPort类
 * 代表输出端口，继承自JointJS的Polygon形状
 */
export class OutputPort extends shapes.standard.Polygon { }
