/**
 * 表单数据类型
 */
interface CaseForm {
    /**
     * 案件名称
     */
    currentCaseName: string;
    /**
     * 送检单位
     */
    sendUnit: string;
    /**
     * 检材持有人姓名
     */
    Name: string;
    /**
     * 检材持有人证件类型
     */
    CertificateType: string;
    /**
     * 检材持有人证件编号
     */
    CertificateCode: string;
    /**
     * 检材持有人证件签发机关
     */
    CertificateIssueUnit: string;
    /**
     * 检材持有人证件生效日期
     */
    CertificateEffectDate: string;
    /**
     * 检材持有人证件失效日期
     */
    CertificateInvalidDate: string;
    /**
     * 检材持有人性别
     */
    SexCode: string;
    /**
     * 民族
     */
    Nation: string;
    /**
     * 检材持有人生日
     */
    Birthday: string;
    /**
     * 检材持有人证件头像
     */
    UserPhoto: string;
    /**
     * 检材持有人住址
     */
    Address: string;
    /**
     * 执法办案系统案件编号
     */
    CaseNo: string;
    /**
     * 执法办案系统案件类别
     */
    CaseType: string;
    /**
     * 执法办案系统案件名称
     */
    CaseName: string;
    /**
     * 执法办案人员编号/检材持有人编号
     */
    CasePersonNum: string;
}

export { CaseForm };