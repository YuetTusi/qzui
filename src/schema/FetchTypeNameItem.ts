/**
 * 采集方式结构体
 */
class FetchTypeNameItem {
    /**
     * 采集方式ID
     */
    public nFetchTypeID?: number;
    /**
     * 采集方式描述
     */
    public m_strDes?: string;
    public strFetchTypeName?: string;

    constructor(props: any = {}) {
        this.m_strDes = props.m_strDes || '';
        this.nFetchTypeID = props.nFetchTypeID || 0;
        this.strFetchTypeName = props.strFetchTypeName || '';
    }
}

export { FetchTypeNameItem };
export default FetchTypeNameItem;