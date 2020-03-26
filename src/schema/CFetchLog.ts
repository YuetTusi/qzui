/**
 * 采集日志对象
 */
class CFetchLog {
    /**
     * 开始采集时间
     */
    public m_strStartTime: string = '';
    /**
     * 采集方式
     */
    public m_strFetchType: string = '';
    /**
     * 案件操作员
     */
    public m_strChecker: string = '';
    /**
     * 程序版本
     */
    public m_strVersion: string = '';
    /**
     * 是否用户取消采集
     */
    public m_strIsCancel: string = '';
    /**
     * 结束时间
     */
    public m_strFinishTime: string = '';
    /**
     * 案件绝对路径
     */
    public m_strCasePath: string = '';
    /**
     * 手机绝对路径
     */
    public m_strPhonePath: string = '';

    constructor(props: any = {}) {
        this.m_strStartTime = props.m_strStartTime || '';
        this.m_strFetchType = props.m_strFetchType || '';
        this.m_strChecker = props.m_strChecker || '';
        this.m_strVersion = props.m_strVersion || '';
        this.m_strIsCancel = props.m_strIsCancel || '';
        this.m_strFinishTime = props.m_strFinishTime || '';
        this.m_strCasePath = props.m_strCasePath || '';
        this.m_strPhonePath = props.m_strPhonePath || '';
    }
}

export { CFetchLog };
export default CFetchLog;