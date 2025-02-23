import { PortArg, PassBy } from '../types/arg';
import { FppType } from '../types/types';

export interface ReturnType {
    type: FppType;
    pass_by?: PassBy;
}

// TODO import_serializable_type, import_enum_type, import_array_type, include_header
// 每个 Component 的端口集定义了它与外界交互的方式，即它的外部接口。
// 因此，正确理解和设计这些端口对于系统的成功至关重要。
export class Port {
    /** 端口名称 */
    name: string;

    /** C++ 命名空间（可选） */
    namespace?: string;

    /** 端口描述注释 */
    comment?: string;

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