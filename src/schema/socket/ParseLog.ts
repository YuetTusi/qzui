import { BaseEntity } from "../db/BaseEntity";
import { ParseState } from "./DeviceState";

/**
 * 解析App
 */
interface ParseApp {
    /**
     * App名称
     */
    appname?: string;
    /**
     * 解析数量
     */
    u64count?: number;
}

/**
 * 解析完成数据
 */
interface ParseEnd {
    /**
     * 案件id
     */
    caseId?: string;
    /**
     * 设备id
     */
    deviceId?: string;
    /**
     * 解析起始时间(Unix时间戳)
     */
    u64parsestarttime: number;
    /**
     * 解析完成时间(Unix时间戳)
     */
    u64parseendtime: number;
    /**
     * 是否成功
     */
    isparseok?: boolean;
    /**
     * App信息
     */
    parseapps?: ParseApp[];
    /**
     * 错误消息
     */
    errmsg?: string;
}

/**
 * 解析日志对象
 */
class ParseLog extends BaseEntity {
    /**
     * 案件名称
     */
    caseName?: string;
    /**
     * 手机名称
     */
    mobileName?: string;
    /**
     * 持有人
     */
    mobileHolder?: string;
    /**
     * 手机编号
     */
    mobileNo?: string;
    /**
     * 备注
     */
    note?: string;
    /**
     * 开始时间
     */
    startTime?: Date;
    /**
     * 结束时间
     */
    endTime?: Date;
    /**
     * 解析状态
     */
    state?: ParseState;
    /**
     * App
     */
    apps?: ParseApp[];
}

export { ParseApp, ParseEnd };
export default ParseLog;