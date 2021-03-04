/**
 * 广州警综平台案件数据
 */
class SendCase {
    /**
     * 案件编号
     */
    CaseID?: string;
    /**
     * 案件名称
     */
    CaseName?: string;
    /**
     * 案件类型代码
     */
    CaseTypeCode?: string;
    /**
     * 案件类型代码
     */
    CaseType?: string;
    /**
     * 案别代码
     */
    ab?: string;
    /**
     * 案别名称
     */
    abName?: string;
    /**
     * 人员编号
     */
    ObjectID?: string;
    /**
     * 姓名
     */
    OwnerName?: string;
    /**
     * 曾用名（别名）
     */
    Bm?: string;
    /**
     * 证件类型Code
     */
    IdentityIDTypeCode?: string;
    /**
     * 证件类型名称
     */
    IdentityIDType?: string;
    /**
     * 证件号码
     */
    IdentityID?: string;
    /**
     * 户籍地址
     */
    Hjdz?: string;
    /**
     * 现地址
     */
    Dz?: string;
    /**
     * 工作单位
     */
    Gzdw?: string;
    /**
     * 国家编码
     */
    GuojiaCode?: string;
    /**
     * 国家名称
     */
    Guojia?: string;
    /**
     * 民族编码
     */
    MinzuCode?: string;
    /**
     * 民族名称
     */
    Minzu?: string;
    /**
     * 手机号码
     */
    Phone?: string;
    /**
     * 描述
     */
    Desc?: string;
    /**
     * 采集日期
     */
    Date?: string;
    /**
     * 采集类型 01嫌疑人02社会人员
     */
    flag?: string;
    /**
     * 采集民警警号
     */
    OfficerID?: string;
    /**
     * 采集民警姓名
     */
    OfficerName?: string;
    /**
     * 采集民警单位代码
     */
    dept?: string;
    /**
     * 采集民警单位名称
     */
    deptName?: string;
    /**
     * 请求唯一id CaseID+CaseName+Phone综合计算得出
     */
    strflg?: string;
    /**
     * 手机绝对路径
     */
    strPhonePath?: string;
    /**
     * 保留字段 
     */
    strreserved1?: string;
    /**
     * 保留字段 
     */
    strreserved2?: string;
    /**
     * 错误码
     */
    errcode?: number;
    /**
     * 错误消息
     */
    errmsg?: string;
}

export { SendCase };
export default SendCase;