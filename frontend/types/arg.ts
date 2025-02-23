import { FppType } from './types';

export enum PassBy {
    DEFAULT = "default",
    POINTER = "pointer",
    REFERENCE = "reference"
}

export class Arg {
    /** 参数名称 */
    name: string;

    /** 参数类型 */
    type: FppType;

    /** 如果类型为string，则指定字符串的大小 */
    size?: number;

    constructor(name: string, type: FppType, size?: number) {
        this.name = name;
        this.type = type;
        this.size = size;
    }
}

export class PortArg extends Arg {
    /** 
     * 指定参数如何传递给处理函数
     * - default: 原始值按值传递，其他按const引用传递
     * - pointer: 通过指针传递
     * - reference: 通过可变引用传递
     */
    pass_by?: PassBy;

    constructor(name: string, type: FppType, size?: number, pass_by?: PassBy) {
        super(name, type, size);
        this.pass_by = pass_by ?? PassBy.DEFAULT;
    }
}