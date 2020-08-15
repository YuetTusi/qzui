/**
 * BCP
 */
class BcpEntity {
    /**
     * 手机绝对路径
     */
    mobilePath: string;
    /**
     * 有无附件
     */
    attachment: boolean;
    /**
     * 检验单位（案件数据中用户手动输入的字段）
     */
    checkUnitName?: string;
    /**
     * 采集单位名称
     */
    unitName: string;
    /**
     * 采集单位编号
     */
    unitNo: string;
    /**
     * 目的检验单位名称
     */
    dstUnitName: string;
    /**
     * 目的检验单位编号
     */
    dstUnitNo: string;
    /**
     * 采集人员
     */
    officerName: string;
    /**
     * 采集人员编号（6位警号）
     */
    officerNo: string;
    /**
     * 持有人
     */
    mobileHolder: string;
    /**
     * 证件类型
     */
    credentialType?: string;
    /**
     * 证件编号
     */
    credentialNo?: string;
    /**
     * 证件生效日期
     */
    credentialEffectiveDate?: string;
    /**
     * 证件失效日期
     */
    credentialExpireDate?: string;
    /**
     * 证件签发机关
     */
    credentialOrg?: string;
    /**
     * 认证头像
     */
    credentialAvatar?: string;
    /**
     * 性别
     */
    gender?: string;
    /**
     * 民族
     */
    nation?: string;
    /**
     * 出生日期
     */
    birthday?: string;
    /**
     * 住址
     */
    address?: string;
    /**
     * 网安部门案件编号
     */
    securityCaseNo?: string;
    /**
     * 网安部门案件类别
     */
    securityCaseType?: string;
    /**
     * 网安部门案件名称
     */
    securityCaseName?: string;
    /**
     * 执法办案系统案件编号
     */
    handleCaseNo?: string;
    /**
     * 执法办案系统案件类别
     */
    handleCaseType?: string;
    /**
     * 执法办案系统案件名称
     */
    handleCaseName?: string;
    /**
     * 执法办案人员编号
     */
    handleOfficerNo?: string;

    constructor(props?: any) {
        this.mobilePath = props?.mobilePath || '';
        this.attachment = props?.attachment || false;
        this.unitName = props?.unitName || '';
        this.unitNo = props?.unitNo || '';
        this.dstUnitName = props?.dstUnitName || '';
        this.dstUnitNo = props?.distUnitNo || '';
        this.officerName = props?.officerName || '';
        this.officerNo = props?.officerNo || '';
        this.mobileHolder = props?.mobileHolder || '';
    }
}

export { BcpEntity }
export default BcpEntity;