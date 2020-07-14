import { BaseEntity } from "../db/BaseEntity";

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
     * 采集方式
     */
    public fetchType?: string;
    /**
     * 采集时间
     */
    public fetchTime?: Date;
    /**
     * 采集记录
     */
    public record?: Record<any, string>[];
}

export { FetchLog };
export default FetchLog;