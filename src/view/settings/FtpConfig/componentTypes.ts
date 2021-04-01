import { FormComponentProps } from "antd/lib/form";

interface Prop extends FormComponentProps { }

/**
 * 表单
 */
interface FormValue {
    /**
     * 是否启用
     */
    enable: boolean,
    /**
     * IP地址
     */
    ip: string,
    /**
     * 端口号
     */
    port: number,
    /**
     * 用户名
     */
    username: string,
    /**
     * 口令
     */
    password: string,
    /**
     * 上传目录
     */
    serverPath: string
}

export { Prop, FormValue };