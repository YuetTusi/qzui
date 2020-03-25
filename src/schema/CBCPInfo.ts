/**
 * 案件录入BCP信息
 */
class CBCPInfo {
    /**
     * 检验员姓名
     */
    public m_strCheckerName?: string;
    /**
     * 检验员ID
     */
    public m_strCheckerID?: string;
    /**
     * 检验员所属单位名称
     */
    public m_strCheckOrganizationName?: string;
    /**
     * 检验员所属单位ID
     */
    public m_strCheckOrganizationID?: string;
    /**
     * 目的检验单位ID
     */
    public m_strDstOrganizationID?: string;
    /**
     * 目的检验单位名称
     */
    public m_strDstOrganizationName?: string;
    /**
     * 检材持有人证件类型
     */
    public m_strCertificateType?: string;
    /**+
     * 检材持有人证件编号
     */
    public m_strCertificateCode?: string;
    /**
     * 检材持有人证件签发机关
     */
    public m_strCertificateIssueUnit?: string;
    /**
     * 检材持有人证件生效日期
     */
    public m_strCertificateEffectDate?: string;
    /**
     * 检材持有人证件失效日期
     */
    public m_strCertificateInvalidDate?: string;
    /**
     * 检材持有人性别
     */
    public m_strSexCode?: string;
    /**
     * 检材持有人民族
     */
    public m_strNation?: string;
    /**
     * 检材持有人生日
     */
    public m_strBirthday?: string;
    /**
     * 检材持有人住址
     */
    public m_strAddress?: string;
    /**
     * 检材持有人证件头像（路径)
     */
    public m_strUserPhoto?: string;

    constructor(props: any = {}) {
        this.m_strCheckerName = props.m_strCheckerName || '';
        this.m_strCheckerID = props.m_strCheckerID || '';
        this.m_strCheckOrganizationName = props.m_strCheckOrganizationName || '';
        this.m_strCheckOrganizationID = props.m_strCheckOrganizationID || '';
        this.m_strDstOrganizationID = props.m_strDstOrganizationID || '';
        this.m_strDstOrganizationName = props.m_strDstOrganizationName || '';
        this.m_strCertificateType = props.m_strCertificateType || '';
        this.m_strCertificateCode = props.m_strCertificateCode || '';
        this.m_strCertificateIssueUnit = props.m_strCertificateIssueUnit || '';
        this.m_strCertificateEffectDate = props.m_strCertificateEffectDate || '';
        this.m_strCertificateInvalidDate = props.m_strCertificateInvalidDate || '';
        this.m_strSexCode = props.m_strSexCode || '';
        this.m_strNation = props.m_strNation || '';
        this.m_strBirthday = props.m_strBirthday || '';
        this.m_strAddress = props.m_strAddress || '';
        this.m_strUserPhoto = props.m_strUserPhoto || '';
    }
}

export { CBCPInfo };