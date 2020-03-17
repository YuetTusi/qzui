import { CClientInfo } from '@src/schema/CClientInfo';
import { CBCPInfo } from './CBCPInfo';
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
     * 检材编号
     */
    public m_strDeviceNumber?: string;
    /**
     * 案件名称
     */
    public m_strCaseName?: string;
    /**
     * 手机持有人
     */
    public m_strDeviceHolder?: string;
    /**
     * 检验员姓名
     */
    public m_strCheckerName?: string;
    /**
     * 检验员ID
     */
    public m_strCheckerID?: string;
    /**
     * 检验员所属单位名称
     */
    public m_strCheckOrganizationName?: string;
    /**
     * 检验员所属单位ID
     */
    public m_strCheckOrganizationID?: string;
    /**
     * 是否自动解析
     */
    public m_bIsAutoParse?: boolean;
    /**
     * 是否生成BCP
     */
    public m_bIsGenerateBCP?: boolean;
    /**
     * 解析App列表
     */
    public m_Applist?: string[];
    /**
     * 采集类型（与AppDataExtractType枚举对应）
     */
    public m_nFetchType?: number;
    /**
     * 送检单位对象
     */
    public m_ClientInfo?: CClientInfo;
    /**
     * BCP数据
     */
    public m_BCPInfo?: CBCPInfo;


    constructor(props: any = {}) {
        this.m_strDeviceName = props.m_strDeviceName || '';
        this.m_strDeviceNumber = props.m_strDeviceNumber || '';
        this.m_strCaseName = props.m_strCaseName || '';
        this.m_strDeviceHolder = props.m_strDeviceHolder || '';
        this.m_strCheckerName = props.m_strCheckerName || '';
        this.m_strCheckerID = props.m_strCheckerID || '';
        this.m_strCheckOrganizationName = props.m_strCheckOrganizationName || '';
        this.m_strCheckOrganizationID = props.m_strCheckOrganizationID || '';
        this.m_bIsAutoParse = props.m_bIsAutoParse || false;
        this.m_bIsGenerateBCP = props.m_bIsGenerateBCP || false;
        // this.m_Applist = props.m_Applist || [];
        this.m_nFetchType = props.m_nFetchType || 0;
        this.m_ClientInfo = props.m_ClientInfo || new CClientInfo();
        this.m_BCPInfo = props.m_BCPInfo || new CBCPInfo();
    }
}

export { CFetchDataInfo };
export default CFetchDataInfo;