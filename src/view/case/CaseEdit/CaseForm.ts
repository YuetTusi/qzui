/**
 * 表单数据类型
 */
interface CaseForm {
    /**
     * 案件名称
     */
    currentCaseName: string;
    /**
     * 案件存储路径
     */
    m_strCasePath: string;
    /**
     * 检验员
     */
    // checkerName: string;
    /**
     * 检验员编号
     */
    // checkerNo: string;
    /**
     * 检验单位
     */
    m_strCheckUnitName: string;
    /**
     * 送检目的单位
     */
    // m_strDstCheckUnitName: string;
}

export { CaseForm };