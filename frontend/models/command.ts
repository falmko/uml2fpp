import { Arg } from '../types/arg';

export enum CommandKind {
    SYNC = "sync",         // 直接调用派生类方法
    GUARDED = "guarded",   // 使用互斥锁保护的调用
    ASYNC = "async"        // 异步消息调用
}

export enum QueueFull {
    DROP = "drop",       // 丢弃消息
    BLOCK = "block",     // 阻塞等待
    ASSERT = "assert"    // 触发断言（默认）
}

// 每个组件定义了一组用于操作的命令。这些命令专为用户与组件交互设计，不同于用于组件间通信的端口。
// 命令是通过一系列属性来定义的，允许用户向 F' 系统发送指令，这些指令再由 Svc::CmdDispatcher 分发给相应的处理组件以执行特定行为。
export interface Command {
    /** 命令助记符 */
    mnemonic: string;

    /** 命令操作码 */
    opcode: number;

    /** 命令类型 */
    kind: CommandKind;

    /** 异步命令的优先级（可选） */
    priority?: number;

    /** 异步命令队列满时的行为 */
    full?: QueueFull;

    /** 命令参数列表 */
    args: Arg[];

    /** 命令描述注释 */
    comment?: string;
}

export class Commands {
    /** 操作码基础值（可选） */
    opcode_base?: number;

    /** 命令列表 */
    commands: Command[];

    constructor(opcode_base?: number, commands: Command[] = []) {
        this.opcode_base = opcode_base;
        this.commands = commands;
    }
}