/**
 * 表单数据类型
 */
interface CaseForm {
    /**
     * 案件名称
     */
    currentCaseName: string;
    /**
     * 检验单位
     */
    m_strCheckUnitName: string;
    /**
     * 送检目的单位
     */
    m_strDstCheckUnitName: string;
    /**
     * 网安部门案件编号
     */
    m_strCaseNo: string;
    /**
     * 网安部门案件类别
     */
    m_strCaseType: string;
    /**
     * 网安部门案件名称
     */
    m_strBCPCaseName: string;
    /**
     * 执法办案系统案件编号
     */
    m_strGaCaseNo: string;
    /**
     * 执法办案系统案件类别
     */
    m_strGaCaseType: string;
    /**
     * 执法办案系统案件名称
     */
    m_strGaCaseName: string;
    /**
     * 执法办案人员编号/检材持有人编号
     */
    m_strGaCasePersonNum: string;
}

export { CaseForm };