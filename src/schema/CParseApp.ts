/**
 * 应用APP
 */
class CParseApp {
    /**
     * AppID
     */
    public m_strID: string;
    /**
     * App包名列表
     */
    public m_strPktlist?: string[];
    /**
     * 云取证应用Key值
     */
    public key?: string;

    constructor(props: any = {}) {
        this.m_strID = props.m_strID ?? '';
        this.m_strPktlist = props.m_strPktlist ?? [];
        this.key = props.key ?? '';
    }
}

export { CParseApp };