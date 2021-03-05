import { Dispatch } from 'redux';
import { CloudCodeModalStoreState } from '@src/model/components/CloudCodeModal';
import { StoreComponent } from '@src/type/model';
import { CloudApp } from '@src/schema/socket/CloudApp';

/**
 * 属性
 */
export interface Prop extends Partial<StoreComponent> {
    /**
     * 仓库State
     */
    cloudCodeModal: CloudCodeModalStoreState,
    /**
     * 取消handle
     */
    cancelHandle: () => void
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
     * 取消
     */
    Cancel = 5,
    /**
     * 重新发送验证码
     */
    ResendCode = 6,
}

/**
 * 验证码进度消息（一条）
 */
export interface CaptchaMsg {
    /**
     * 内容
     */
    content: string,
    /**
     * 类型
     */
    type: number,
    /**
     * 消息时间
     */
    actionTime: Date
}

/**
 * CodeItem属性
 */
export interface CodeItemProps {
    /**
     * USB序号
     */
    usb: number,
    /**
     * 云取应用
     */
    app: CloudApp,
    /**
     * Dispatch方法
     */
    dispatch: Dispatch<any>
}

/**
 * 消息类型
 */
export enum SmsMessageType {
    /**
     * 一般消息（黑色）
     */
    Normal,
    /**
     * 警告消息（红色）
     */
    Warning,
    /**
     * 重要消息（蓝色）
     */
    Important
}