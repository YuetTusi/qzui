import { FormComponentProps } from "antd/lib/form";

/**
 * 属性
 */
interface Prop extends FormComponentProps {
    /**
     * 是否显示
     */
    visibie: boolean;
    /**
     * 获取handle
     */
    okHandle: (savePath: string) => void;
    /**
     * 取消handle
     */
    cancelHandle: () => void;
}

export { Prop };