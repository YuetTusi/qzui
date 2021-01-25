import DeviceType from '@src/schema/socket/DeviceType';
import { FormComponentProps } from 'antd/lib/form';

/**
 * 属性
 */
export interface Prop extends FormComponentProps {
    /**
     * 是否显示
     */
    visible: boolean,
    /**
     * 设备
     */
    device: DeviceType,
    /**
     * 确定handle
     */
    okHandle: (code: string, device: DeviceType) => void,
    /**
     * 取消handle
     */
    cancelHandle: () => void
}

/**
 * 表单
 */
export interface FormValue {
    /**
     * 短信验证码
     */
    smsCode: string
}