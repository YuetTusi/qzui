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
     * 检验单位
     */
    m_strCheckUnitName: string;
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
    /**
     * 执法办案人员编号/检材持有人编号
     */
    handleOfficerNo: string;
    /**
     * AI分析缩略图
     */
    aiThumbnail: boolean;
    /**
     * AI武器类
     */
    aiWeapon: boolean;
    /**
     * AI文档类
     */
    aiDoc: boolean;
    /**
     * AI毒品类
     */
    aiDrug: boolean;
    /**
     * AI裸体类
     */
    aiNude: boolean;
    /**
     * AI货币类
     */
    aiMoney: boolean;
    /**
     * AI着装类
     */
    aiDress: boolean;
    /**
     * AI交通工具
     */
    aiTransport: boolean;
    /**
     * AI证件类
     */
    aiCredential: boolean;
    /**
     * AI聊天转帐类
     */
    aiTransfer: boolean;
    /**
     * AI照片截图
     */
    aiScreenshot: boolean;
}

export { CaseForm };