import { FormComponentProps } from 'antd/lib/form';

export interface ModifyPasswordModalProp extends FormComponentProps<FormValue> {
    /**
     * 打开/关闭
     */
    visible: boolean,
    /**
     * 确定
     */
    onOk: (newPassword: string) => void,
    /**
     * 取消
     */
    onCancel: () => void
}


export interface FormValue {
    /**
     * 原口令
     */
    password: string,
    /**
     * 新口令
     */
    newPassword: string,
    /**
     * 确认口令
     */
    confirmPassword: string
}