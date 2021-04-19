import FetchData from "@src/schema/socket/FetchData";

/**
 * 表单对象
 */
interface FormValue extends FetchData {
    /**
     * 第三方数据路径
     */
    packagePath: string,
    /**
     * SD卡数据位置（安卓数据导入独有）
     */
    sdCardPath?: string
}

export { FormValue };
export default FormValue;