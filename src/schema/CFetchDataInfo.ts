import { CCoronerInfo } from './CCoronerInfo';

/**
 * 案件结构体（采集时）
 */
class CFetchDataInfo {
    public m_strOwner?: string;
    public m_strPhoneID?: string;
    /**
     * 案件名称
     */
    public m_strCaseName?: string;
    public m_strFetchCorp?: string;
    /**
     * 检验员
     */
    // public m_Coroner?: CCoronerInfo;
    /**
     * 是否自动解析
     */
    public m_bIsAutoParse?: boolean;
    /**
     * 是否生成BCP
     */
    public m_bIsBCP?: boolean;
    /**
     * 解析App列表
     */
    // public m_Applist?: string[];
    /**
     * 采集类型（与AppDataExtractType枚举对应）
     */
    public m_nFetchType?: number;

    constructor(props: any = {}) {
        this.m_strOwner = props.m_strOwner || '';
        this.m_strPhoneID = props.m_strPhoneID || '';
        this.m_strCaseName = props.m_strCaseName || '';
        this.m_strFetchCorp = props.m_strFetchCorp || '';
        // this.m_Coroner = props.m_Coroner || new CCoronerInfo();
        this.m_bIsAutoParse = props.m_bIsAutoParse || false;
        this.m_bIsBCP = props.m_bIsBCP || false;
        // this.m_Applist = props.m_Applist || [];
        this.m_nFetchType = props.m_nFetchType || 0;
    }
}

export { CFetchDataInfo };
export default CFetchDataInfo;