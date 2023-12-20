import { FormComponentProps } from 'antd/lib/form';

export interface RegisterUserModalProp extends FormComponentProps<FormValue> {
    /**
     * 打开/关闭
     */
    visible: boolean,
    /**
     * 确定
     */
    onOk: (userName: string, password: string) => void,
    /**
     * 取消
     */
    onCancel: () => void
}

export interface FormValue {
    /**
     * 用户名
     */
    userName: string,
    /**
     * 口令
     */
    password: string,
    /**
     * 确认口令
     */
    confirmPassword: string
}