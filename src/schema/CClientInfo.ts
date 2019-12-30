
/**
 * 送检单位结构体
 */
class CClientInfo {
    /**
     * 送检单位名称
     */
    public m_strClientName: string;

    constructor(props: any = {}) {
        this.m_strClientName = props.m_strCaseName || '';
    }
}

export { CClientInfo };
export default CClientInfo;