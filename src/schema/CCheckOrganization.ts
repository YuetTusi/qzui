/**
 * 检验单位结构体
 */
export class CCheckOrganization {
    /**
     * 单位名称
     */
    public m_strCheckOrganizationName?: string;
    /**
     * 单位ID
     */
    public m_strCheckOrganizationID?: string;
    /**
     * 数据总量
     */
    public m_nCnt?: number;

    constructor(props: any = {}) {
        this.m_strCheckOrganizationName = props.m_strName || '';
        this.m_strCheckOrganizationID = props.m_strID || '';
        this.m_nCnt = props.m_nCnt;
    }
}