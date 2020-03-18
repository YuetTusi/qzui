/**
 * 案件录入BCP信息
 */
class CBCPInfo {
    /**
     * BCP检验单位编号
     */
    public m_strBCPCheckOrganizationID?: string;
    /**
     * 检材持有人证件类型
     */
    public m_strCertificateType?: string;
    /**
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
        this.m_strBCPCheckOrganizationID = props.m_strBCPCheckOrganizationID || '';
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