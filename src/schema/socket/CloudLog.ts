
import { BaseEntity } from "../db/BaseEntity";
import { CloudAppMessages } from "./CloudAppMessages";

/**
 * 云取证日志
 */
class CloudLog extends BaseEntity {

    /**
     * 手机名称
     */
    public mobileName?: string;
    /**
     * 持有人
     */
    public mobileHolder?: string;
    /**
     * 手机号
     */
    public mobileNumber?: string;
    /**
     * 手机编号
     */
    public mobileNo?: string;
    /**
     * 采集时间
     */
    public fetchTime?: Date;
    /**
     * 备注
     */
    public note?: string;
    /**
     * 云取应用
     */
    public apps?: CloudAppMessages[];

    constructor() {
        super();
    }
}

export { CloudLog };
export default CloudLog;