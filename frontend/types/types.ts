// F´ 支持的原始数据类型
export type FppPrimitiveType = "U8" | "I8" | "U16" | "I16" | "U32" | "I32" | "U64" | "I64" | "F32" | "F64" | "bool" | "string";

// F´ 框架定义的枚举类型
export interface FppEnum {
    name: string;
    comment?: string;  // 整个枚举的注释
    items: Array<{
        name: string;
        value?: number;
        comment?: string;
    }>;
}

// 预定义的框架枚举
export const Fw_Enum: { [key: string]: FppEnum } = {
    SerialStatus: {
        name: "SerialStatus",
        comment: "Serialization status values",
        items: [
            { name: "OK", value: 0, comment: "Serialization operation succeeded" },
            { name: "FORMAT_ERROR", value: 1, comment: "Data was the wrong format (e.g. wrong packet type)" },
            { name: "NO_ROOM_LEFT", value: 2, comment: "No room left in the buffer to serialize data" }
        ]
    },
    DeserialStatus: {
        name: "DeserialStatus",
        comment: "Deserialization status values",
        items: [
            { name: "OK", value: 0 },
            { name: "BUFFER_EMPTY", value: 3, comment: "Deserialization buffer was empty when trying to read data" },
            { name: "FORMAT_ERROR", value: 4, comment: "Deserialization data had incorrect values (unexpected data types)" },
            { name: "SIZE_MISMATCH", value: 5, comment: "Data was left in in the buffer, but not enough to deserialize" },
            { name: "TYPE_MISMATCH", value: 6, comment: "Deserialized type ID didn't match" }
        ]
    },
    Enabled: {
        name: "Enabled",
        comment: "Enabled/Disabled state",
        items: [
            { name: "DISABLED", value: 0, comment: "Disabled state" },
            { name: "ENABLED", value: 1, comment: "Enabled state" }
        ]
    },
    On: {
        name: "On",
        comment: "On/Off state",
        items: [
            { name: "OFF", value: 0, comment: "Off state" },
            { name: "ON", value: 1, comment: "On state" }
        ]
    },
    Logic: {
        name: "Logic",
        comment: "Logic state",
        items: [
            { name: "LOW", value: 0, comment: "Logic low state" },
            { name: "HIGH", value: 1, comment: "Logic high state" }
        ]
    },
    Open: {
        name: "Open",
        comment: "Open/Closed state",
        items: [
            { name: "CLOSED", value: 0, comment: "Closed state" },
            { name: "OPEN", value: 1, comment: "Open state" }
        ]
    },
    Direction: {
        name: "Direction",
        comment: "Direction state",
        items: [
            { name: "IN", value: 0, comment: "In direction" },
            { name: "OUT", value: 1, comment: "Out direction" },
            { name: "INOUT", value: 2, comment: "In/Out direction" }
        ]
    },
    Active: {
        name: "Active",
        comment: "Active/Inactive state",
        items: [
            { name: "INACTIVE", value: 0, comment: "Inactive state" },
            { name: "ACTIVE", value: 1, comment: "Active state" }
        ]
    },
    Health: {
        name: "Health",
        comment: "Health state",
        items: [
            { name: "HEALTHY", value: 0, comment: "Healthy state" },
            { name: "SICK", value: 1, comment: "Sick state" },
            { name: "FAILED", value: 2, comment: "Failed state" }
        ]
    },
    Success: {
        name: "Success",
        comment: "Success/Failure state",
        items: [
            { name: "FAILURE", value: 0, comment: "Representing failure" },
            { name: "SUCCESS", value: 1, comment: "Representing success" }
        ]
    },
    Wait: {
        name: "Wait",
        comment: "Wait/No Wait state",
        items: [
            { name: "WAIT", value: 0 },
            { name: "NO_WAIT", value: 1 }
        ]
    }
};

// 所有可用的类型
export type FppType = FppPrimitiveType | keyof typeof Fw_Enum;
