import { BaseEntity } from "../db/BaseEntity";
import FetchRecord from "./FetchRecord";
import { FetchState } from "./DeviceState";

/**
 * 状态
 */
enum FetchLogState {
    /**
     * 采集出错
     */
    Error,
    /**
     * 采集成功
     */
    Success
}

/**
 * 采集日志对象
 */
class FetchLog extends BaseEntity {
    /**
     * 手机编号
     */
    public mobileNo?: string;
    /**
     * 手机名称
     */
    public mobileName?: string;
    /**
     * 持有人
     */
    public mobileHolder?: string;
    /**
     * 备注
     */
    public note?: string;
    /**
     * 采集方式
     */
    public fetchType?: string;
    /**
     * 采集时间
     */
    public fetchTime?: Date;
    /**
     * 采集状态
     */
    public state?: FetchState = FetchState.Finished;
    /**
     * 采集记录
     */
    public record?: FetchRecord[] = [];
}

export { FetchLog, FetchLogState };
export default FetchLog;