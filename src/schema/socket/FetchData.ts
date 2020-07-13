
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
     * 是否自动解析
     */
    isAuto?: boolean;
    /**
     * 是否生成BCP
     */
    isBcp?: boolean;
    /**
     * 是否有附件
     */
    isAttachment?: boolean;
    /**
     * 手机名称
     */
    mobileName?: string;
    /**
     * 手机编号
     */
    mobileNo?: string;
    /**
     * 手机持有人
     */
    mobileHolder?: string;
    /**
     * 采集类型（与AppDataExtractType枚举对应）
     */
    fetchType?: string;
}

export { FetchData };
export default FetchData;