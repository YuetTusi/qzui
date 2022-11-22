import { FormComponentProps } from "antd/lib/form";

export interface HuaweiCloneModalProp extends FormComponentProps<{ targetPath: string }> {

    /**
     * 显示
     */
    visible: boolean,
    /**
     * 确定handle
     */
    onOk: (targetPath: string) => void,
    /**
     * 取消handle
     */
    onCancel: () => void
};