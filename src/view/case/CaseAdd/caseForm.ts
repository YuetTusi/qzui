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