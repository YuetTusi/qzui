import { CClientInfo } from '@src/schema/CClientInfo';
import { CBCPInfo } from './CBCPInfo';
import FetchTypeNameItem from './FetchTypeNameItem';
/**
 * 案件结构体（采集时）
 */
class CFetchDataInfo {
    /**
     * 手机唯一标识（序列号+USB端口号）
     */
    public m_strDeviceID?: string;
    /**
     * 手机名称
     */
    public m_strDeviceName?: string;
    /**
     * 检验员编号
     */
    public m_strThirdCheckerID?: string;
    /**
     * 检验员姓名
     */
    public m_strThirdCheckerName?: string;
    /**
     * 手机编号
     */
    public m_strDeviceNumber?: string;
    /**
     * 案件名称
     */
    public m_strCaseName?: string;
    /**
     * 案件id
     */
    public caseId?: string;
    /**
     * 手机持有人
     */
    public m_strDeviceHolder?: string;
    /**
     * 采集类型（与AppDataExtractType枚举对应）
     */
    public m_nFetchType?: number;
    /**
     * BCP数据
     */
    public m_BCPInfo?: CBCPInfo;

    constructor(props: any = {}) {
        this.m_strDeviceName = props.m_strDeviceName || '';
        this.m_strDeviceNumber = props.m_strDeviceNumber || '';
        this.m_strThirdCheckerID = props.m_strThirdCheckerID || '';
        this.m_strThirdCheckerName = props.m_strThirdCheckerName || '';
        this.m_strCaseName = props.m_strCaseName || '';
        this.caseId = props.caseId || '';
        this.m_strDeviceHolder = props.m_strDeviceHolder || '';
        this.m_nFetchType = props.m_nFetchType || 0;
        this.m_BCPInfo = props.m_BCPInfo || new CBCPInfo();
    }
}

export { CFetchDataInfo };
export default CFetchDataInfo;