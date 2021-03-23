import FetchData from "@src/schema/socket/FetchData";

/**
 * 表单对象
 */
interface FormValue extends FetchData {
    /**
     * 第三方数据路径
     */
    packagePath: string
}

export { FormValue };
export default FormValue;