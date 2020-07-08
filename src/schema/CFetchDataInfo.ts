
/**
 * 案件结构体（采集时）
 */
class CFetchDataInfo {
    /**
     * 案件名称
     */
    m_strCaseName?: string;
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
     * 是否有附件
     */
    isAttachment?: boolean;
    /**
     * 手机名称
     */
    m_strDeviceName?: string;
    /**
     * 手机编号
     */
    m_strDeviceNumber?: string;
    /**
     * 手机持有人
     */
    m_strDeviceHolder?: string;
    /**
     * 采集类型（与AppDataExtractType枚举对应）
     */
    m_nFetchType?: number;

    constructor(props: any = {}) {
        this.m_strDeviceName = props.m_strDeviceName || '';
        this.m_strDeviceNumber = props.m_strDeviceNumber || '';
        this.m_strCaseName = props.m_strCaseName || '';
        this.caseId = props.caseId || '';
        this.casePath = props.casePath || 'C:\\';
        this.appList = props.appList || [];
        this.isAuto = props.isAuto || false;
        this.isAttachment = props.isAttachment || false;
        this.m_strDeviceHolder = props.m_strDeviceHolder || '';
        this.m_nFetchType = props.m_nFetchType || 0;
    }
}

export { CFetchDataInfo };
export default CFetchDataInfo;