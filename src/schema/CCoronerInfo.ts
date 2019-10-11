/**
 * 检验员结构体
 */
export class CCoronerInfo {
    /**
     * 检验员姓名
     */
    public m_strCoronerName?: string;
    /**
     * 检验员编号
     */
    public m_strCoronerID?: string;

    constructor(props: any = {}) {
        this.m_strCoronerName = props.m_strCoronerName;
        this.m_strCoronerID = props.m_strCoronerID;
    }
}