/**
 * 表单对象
 */
interface FormValue {
    /**
     * 第三方数据路径
     */
    dataPath: string;
    /**
     * 案件路径
     */
    casePath: string;
    /**
     * 手机名称
     */
    name: string;
    /**
     * 手机品牌（用户手填）
     */
    manufacturer: string;
    /**
     * 手机型号（用户手填）
     */
    model: string;
    /**
     * 手机编号
     */
    mobileNo: string;
    /**
     * 手机持有人
     */
    user: string;
    /**
     * 采集人员
     */
    officer: string;
    /**
     * 采集单位
     */
    unit: string;
}

export { FormValue };
export default FormValue;