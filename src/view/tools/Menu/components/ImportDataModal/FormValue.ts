import { AppDataExtractType } from "@src/schema/AppDataExtractType";

/**
 * 表单对象
 */
interface FormValue {
    /**
     * 第三方数据路径
     */
    dataPath: string;
    /**
     * 案件
     */
    case: string;
    /**
     * 检验员
     */
    police: string;
    /**
     * 检验单位
     */
    unit: string;
    /**
     * 手机名称
     */
    name: string;
    /**
     * 手机品牌（用户手填）
     */
    brand: string;
    /**
     * 手机型号（用户手填）
     */
    piModel: string;
    /**
     * 设备编号
     */
    deviceNumber: string;
    /**
     * 手机持有人
     */
    user: string;
    /**
     * 检验员(BCP为false时)
     */
    officerInput: string;
    /**
     * 检验单位(BCP为false时)
     */
    unitInput: string;
    /**
     * 检验员(BCP为true时)
     */
    officerSelect: string;
    /**
     * 检验单位(BCP为true时)
     */
    unitList: string;
    /**
     * 采集方式
     */
    collectType: AppDataExtractType;
}

export { FormValue };
export default FormValue;