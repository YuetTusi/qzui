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
     * @param code 验证码
     * @param action 点按枚举
     * @param device 设备
     */
    okHandle: (code: string, action: CloudModalPressAction, device: DeviceType) => void,
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

/**
 * 点按动作枚举
 */
export enum CloudModalPressAction {
    /**
     * 发送
     */
    Send = 4,
    /**
     * 跳过
     */
    Skip = 5,
    /**
     * 重新发送验证码
     */
    ResendCode = 6,
}