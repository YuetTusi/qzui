/**
 * 表单数据类型
 */
interface CaseForm {
    /**
     * 案件名称
     */
    currentCaseName: string;
    /**
     * 备用案件名称
     */
    spareName: string;
    /**
     * 案件存储路径
     */
    m_strCasePath: string;
    /**
     * 检验单位
     */
    m_strCheckUnitName: string;
    /**
     * 违规时段起
     */
    ruleFrom: number;
    /**
     * 违规时段止
     */
    ruleTo: number;
    /**
     * 采集人员编号
     */
    officerNo: string;
    /**
         * 网安部门案件编号
         */
    securityCaseNo: string;
    /**
     * 网安部门案件类别
     */
    securityCaseType: string;
    /**
     * 网安部门案件名称
     */
    securityCaseName: string;
    /**
     * 执法办案系统案件编号
     */
    handleCaseNo: string;
    /**
     * 执法办案系统案件类别
     */
    handleCaseType: string;
    /**
     * 执法办案系统案件名称
     */
    handleCaseName: string;
}

export { CaseForm };