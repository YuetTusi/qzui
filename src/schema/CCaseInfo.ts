import { CClientInfo } from './CClientInfo';
/**
 * 案件结构体（维护时）
 */
class CCaseInfo {
    /**
     * 案件名称
     */
    public m_strCaseName: string;
    /**
     * 执法办案系统案件编号
     */
    public m_strCaseNo: string;
    /**
     * 执法办案系统案件类别
     */
    public m_strCaseType: string;
    /**
     * 执法办案系统案件名称
     */
    public m_strBCPCaseName: string;
    /**
     * 执法办案人员编号/检材持有人编号
     */
    public m_strCasePersonNum: string;
    /**
     * 是否自动解析
     */
    public m_bIsAutoParse: boolean;
    /**
     * 是否生成BCP
     */
    public m_bIsGenerateBCP: boolean;
    /**
     * App列表
     */
    public m_Applist: string[];

    /**
     * 送检单位对象
     */
    public m_Clientinfo: CClientInfo;

    constructor(props: any = {}) {
        this.m_strCaseName = props.m_strCaseName || '';
        this.m_strCaseNo = props.m_strCaseNo || '';
        this.m_strCaseType = props.m_strCaseType || '';
        this.m_strBCPCaseName = props.m_strBCPCaseName || '';
        this.m_strCasePersonNum = props.m_strCasePersonNum || '';
        this.m_bIsAutoParse = props.m_bIsAutoParse || false;
        this.m_bIsGenerateBCP = props.m_bIsGenerateBCP || false;
        this.m_Applist = props.m_Applist || [];
        this.m_Clientinfo = props.m_Clientinfo || {};
    }
}

export { CCaseInfo };
export default CCaseInfo;