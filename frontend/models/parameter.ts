import { FppType } from '../types/types';

// 参数用于在嵌入式系统中存储非易失性状态。
// F' 提供了代码生成功能来管理和持久化这些参数。
export interface Parameter {
    /** 参数ID */
    id: number;

    /** 参数名称 */
    name: string;

    /** 参数数据类型 */
    data_type: FppType;

    /** 字符串类型的大小（可选） */
    size?: number;

    /** 默认值（仅用于内置类型） */
    default?: string;

    /** 参数描述注释 */
    comment?: string;

    /** 设置参数的命令操作码 */
    set_opcode: number;

    /** 保存参数的命令操作码 */
    save_opcode: number;
}

export class Parameters {
    // 以下部分为参数的基本属性，需要集成在Component中，参见 fprime/Autocoders/Python/templates/ExampleComponentAi.xml
    /** 参数ID基础值（可选） */
    parameter_base?: number;

    /** 操作码基础值（可选） */
    opcode_base?: number;

    /** 参数列表 */
    parameters: Parameter[];

    constructor(parameter_base?: number, opcode_base?: number, parameters: Parameter[] = []) {
        this.parameter_base = parameter_base;
        this.opcode_base = opcode_base;
        this.parameters = parameters;
    }
}