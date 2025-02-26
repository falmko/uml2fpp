import { Arg } from '../types/arg';

export enum Severity {
    DIAGNOSTIC = "DIAGNOSTIC",       // 软件调试信息
    ACTIVITY_LO = "ACTIVITY_LO",    // 低优先级软件执行事件
    ACTIVITY_HI = "ACTIVITY_HI",    // 高优先级软件执行事件
    COMMAND = "COMMAND",            // 命令执行相关事件
    WARNING_LO = "WARNING_LO",      // 低重要性错误条件
    WARNING_HI = "WARNING_HI",      // 高重要性错误条件
    FATAL = "FATAL"                 // 不可恢复的错误条件
}

// 事件是对系统活动的日志记录，类似于程序执行日志，有助于跟踪系统的运行状况。
// 事件通常用于捕获组件的操作，并且都应被捕获以供地面站分析。
export class Event {
    // 以下部分为Event的基本属性，需要集成在Component中，参见 fprime/Autocoders/Python/templates/ExampleComponentAi.xml
    /** 事件ID */
    id: number;

    /** 事件名称 */
    name: string;

    /** 事件严重程度 */
    severity: Severity;

    /** C风格格式化字符串，用于显示事件信息 */
    format_string: string;

    /** 事件节流阈值（非负整数） */
    throttle?: number;

    /** 事件描述注释 */
    comment?: string;

    /** 事件参数列表 */
    args: Arg[];

    constructor(
        id: number,
        name: string,
        severity: Severity,
        format_string: string,
        throttle?: number,
        comment?: string,
        args: Arg[] = []
    ) {
        this.id = id;
        this.name = name;
        this.severity = severity;
        this.format_string = format_string;
        this.throttle = throttle;
        this.comment = comment;
        this.args = args;
    }
}