import { Port } from './port';
import { Telemetry } from './telemetry';
import { Parameters } from './parameter';
import { Event } from './event';
import { Commands } from './command';

export enum ComponentKind {
    ACTIVE = "ACTIVE",      // 有线程有队列
    PASSIVE = "PASSIVE",   // 无线程无队列
    QUEUED = "QUEUED",     // 有队列无线程
}

export class Component {
    // 以下部分为组件的基本属性，参见 fprime/Autocoders/Python/templates/ExampleComponentAi.xml
    /** 组件名称 */
    name: string;

    /** C++命名空间（可选） */
    namespace?: string;

    /** 组件类型 */
    kind: ComponentKind;

    /** 
     * 建模器标志
     * true: 不自动创建命令、遥测、事件和参数的端口
     * false: 自动创建这些端口
     */
    modeler: boolean;

    /** 端口列表 */
    ports: Port[];

    /** 遥测定义 */
    telemetry?: Telemetry;

    /** 参数定义 */
    parameters?: Parameters;

    /** 事件列表 */
    events: Event[];

    /** 命令定义 */
    commands?: Commands;

    constructor(
        name: string,
        kind: ComponentKind,
        modeler: boolean = false,
        namespace?: string,
        ports: Port[] = [],
        telemetry?: Telemetry,
        parameters?: Parameters,
        events: Event[] = [],
        commands?: Commands
    ) {
        this.name = name;
        this.kind = kind;
        this.modeler = modeler;
        this.namespace = namespace;
        this.ports = ports;
        this.telemetry = telemetry;
        this.parameters = parameters;
        this.events = events;
        this.commands = commands;
    }
}