/**
 * 检验员结构体
 * @deprecated 该实体被废弃
 */
export class CCheckerInfo {
    /**
     * 检验员姓名
     */
    public m_strCheckerName?: string;
    /**
     * 检验员编号
     */
    public m_strCheckerID?: string;

    /**
     * 唯一ID（UUID）
     */
    public m_strUUID?: string;

    constructor(props: any = {}) {
        this.m_strCheckerName = props.m_strCheckerName || '';
        this.m_strCheckerID = props.m_strCheckerID || '';
        this.m_strUUID = props.m_strUUID || '';
    }
}