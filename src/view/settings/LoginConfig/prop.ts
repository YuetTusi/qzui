import { FormComponentProps } from 'antd/lib/form';

export interface LoginConfigProp extends FormComponentProps<FormValue> { }

export interface FormValue {

    /**
     * 密码允许尝试次数（1-5）
     */
    allowCount: number,
    /**
     * 锁定时间（分钟）
     */
    lockMinutes: number,
    /**
     * 登录超时时间（分钟）
     * 用户空闲无操作超过此时间，将踢出登录页
     */
    loginOverTime: number
}