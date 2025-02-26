import { FppType } from '../types/types';

export enum UpdateType {
    ALWAYS = "ALWAYS",
    ON_CHANGE = "ON_CHANGE"
}

// 遥测通道代表系统状态的当前读数，可以设定频率采样并发送到地面。
// 遥测通道具有唯一 ID、时间戳和值三元组。
export interface Channel {
    /** 通道ID */
    id: number;
    
    /** 通道名称 */
    name: string;
    
    /** 数据类型 */
    data_type: FppType;
    
    /** 字符串类型的大小（可选） */
    size?: number;
    
    /** 通道缩写（用于AMPCS系统） */
    abbrev: string;
    
    /** 更新方式 */
    update: UpdateType;
    
    /** 显示格式字符串 */
    format_string?: string;
    
    /** 描述注释 */
    comment?: string;
}

export class Telemetry {
    // 以下部分为遥测端口的基本属性，需要集成在Component中，参见 fprime/Autocoders/Python/templates/ExampleComponentAi.xml
    /** 通道ID基础值（可选） */
    telemetry_base?: number;
    
    /** 遥测通道列表 */
    channels: Channel[];

    constructor(telemetry_base?: number, channels: Channel[] = []) {
        this.telemetry_base = telemetry_base;
        this.channels = channels;
    }
}