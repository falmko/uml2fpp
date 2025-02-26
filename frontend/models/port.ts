import { PortArg, PassBy } from '../types/arg';
import { FppType } from '../types/types';
import { QueueFull } from './command';

export interface ReturnType {
    type: FppType;
    pass_by?: PassBy;
}

export enum PortKind {
    SYNC_INPUT = "SYNC_INPUT",       // 直接调用派生类方法
    GUARDED_INPUT = "GUARDED_INPUT", // 使用互斥锁保护的调用
    ASYNC_INPUT = "ASYNC_INPUT",     // 异步消息调用
    OUTPUT = "OUTPUT"                // 输出端口，从派生类逻辑中调用
}

// TODO import_serializable_type, import_enum_type, import_array_type, include_header
// 每个 Component 的端口集定义了它与外界交互的方式，即它的外部接口。
// 因此，正确理解和设计这些端口对于系统的成功至关重要。
export class Port {
    // 以下部分为端口的基本属性，需要集成在Component中，参见 fprime/Autocoders/Python/templates/ExampleComponentAi.xml
    /** 端口名称 */
    name: string;

    /** 端口类型（同步/异步输入、输出） */
    kind: PortKind;

    /** C++ 命名空间（可选） */
    namespace?: string;

    /** 异步端口的优先级（可选） */
    priority?: number;

    /** 此类型端口的最大数量（可选） */
    max_number?: number;

    /** 异步端口队列满时的行为（可选，默认为 ASSERT） */
    full?: QueueFull;

    /** 建模时的端口角色（可选） */
    role?: string;

    /** 端口描述注释 */
    comment?: string;

    // 以下两部分需要导出为单独的XML文件，参见 fprime/Autocoders/Python/templates/ExamplePortAi.xml
    /** 端口参数列表 */
    args: PortArg[];

    /** 返回值类型（可选） */
    return?: ReturnType;

    constructor(
        name: string,
        namespace?: string,
        comment?: string,
        args: PortArg[] = [],
        returnType?: ReturnType
    ) {
        this.name = name;
        this.namespace = namespace;
        this.comment = comment;
        this.args = args;
        this.return = returnType;
    }
}