/**
 * 检验单位结构体
 */
export class CFetchCorporation {
    /**
     * 单位名称
     */
    public m_strName?: string;
    /**
     * 单位ID
     */
    public m_strID?: string;
    /**
     * 数据总量
     */
    public m_nCnt?: number;

    constructor(props: any = {}) {
        this.m_strName = props.m_strName;
        this.m_strID = props.m_strID;
        this.m_nCnt = props.m_nCnt;
    }
}