import BcpEntity from "./BcpEntity";

/**
 * BCP历史记录实体
 * 此实体类用于记录用户生成BCP记录
 * 当前设备若有记录，则读取自动填充表单的相关项
 */
class BcpHistory extends BcpEntity {
    /**
     * 设备id
     */
    deviceId?: string;

    constructor() {
        super();
    }
}

export { BcpHistory };