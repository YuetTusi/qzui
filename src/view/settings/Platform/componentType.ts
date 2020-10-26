import { FormComponentProps } from "antd/lib/form";

interface Prop extends FormComponentProps { }


interface FormValue {
    /**
     * IP地址
     */
    ip: string,
    /**
     * 端口号
     */
    port: string
}

export { Prop, FormValue };