import { CFetchDataInfo } from '../CFetchDataInfo';

/**
 * 广州接口数据
 */
class PlatformData extends CFetchDataInfo {

    /**
     * 案件编号
     */
    CaseID?: string;
    /**
     * 案件类型代码
     */
    CaseTypeCode?: string;
    /**
     * 案件类型代码
     */
    CaseType?: string;
    /**
     * 案别代码
     */
    ab?: string;
    /**
     * 案别名称
     */
    abName?: string;
    /**
     * 描述
     */
    Desc?: string;
    /**
     * 人员编号
     */
    ObjectID?: string;
    /**
     * 曾用名
     */
    Bm?: string;
    /**
     * 户籍地址
     */
    Hjdz?: string;
    /**
     * 工作单位
     */
    Gzdw?: string;
    /**
     * 国家编码
     */
    GuojiaCode?: string;
    /**
     * 国家名称
     */
    Guojia?: string;
    /**
     * 民族
     */
    Minzu?: string;
    /**
     * 手机号码
     */
    Phone?: string;
    /**
     * 采集类型 01嫌疑人 02社会人员
     */
    flag?: string;


    constructor(props: any = {}) {
        super(props);
    }
}

export default PlatformData;