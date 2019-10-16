
/**
 * 案件结构体（维护时）
 */
class CCaseInfo {
    /**
     * 案件名称
     */
    public m_strCaseName: string;
    /**
     * 是否自动解析
     */
    public m_bIsAutoParse: boolean;
    /**
     * 是否生成BCP
     */
    public m_bIsBCP: boolean;
    /**
     * App列表
     */
    public m_Applist: string[];

    constructor(props: any = {}) {
        this.m_strCaseName = props.m_strCaseName || '';
        this.m_bIsAutoParse = props.m_bIsAutoParse || false;
        this.m_bIsBCP = props.m_bIsBCP || false;
        this.m_Applist = props.m_Applist || [];
    }
}

export { CCaseInfo };
export default CCaseInfo;