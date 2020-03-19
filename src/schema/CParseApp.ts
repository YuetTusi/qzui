/**
 * 用户选择的要解析的APP信息
 */
class CParseApp {
    /**
     * AppID
     */
    public m_strID: string;
    /**
     * App包名列表
     */
    public m_strPktlist: string[];

    constructor(props: any = {}) {
        this.m_strID = props.m_strID || '';
        this.m_strPktlist = props.m_strPktlist || [];
    }
}

export { CParseApp };