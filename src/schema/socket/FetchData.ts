import { DataMode } from "../DataMode";

/**
 * 采集对象
 */
class FetchData {
    /**
     * 案件名称
     */
    caseName?: string;
    /**
     * 案件id
     */
    caseId?: string;
    /**
     * 案件存储路径（用户所选绝对路径）
     */
    casePath?: string;
    /**
     * 解析APP包名
     */
    appList?: string[];
    /**
     * 是否拉取SD卡
     */
    sdCard?: boolean;
    /**
     * 是否自动解析
     */
    isAuto?: boolean;
    /**
     * 手机名称
     */
    mobileName?: string;
    /**
     * 手机编号
     */
    mobileNo?: string;
    /**
     * 手机持有人（点验版为`姓名`，共用此字段）
     */
    mobileHolder?: string;
    /**
     * 证件号码
     */
    credential?: string;
    /**
     * 备注（点验版为`设备手机号`，共用此字段）
     */
    note?: string;
    /**
     * 检验单位
     */
    unitName?: string;
    /**
     * 序列号
     */
    serial?: string;
    /**
     * 模式（0为标准版本,1为点验版本,2为广州警综平台版本）
     */
    mode?: DataMode;
}

export { FetchData };
export default FetchData;