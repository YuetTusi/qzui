import { Dispatch } from 'redux';
import { CloudCodeModalStoreState } from '@src/model/components/CloudCodeModal';
import { StoreComponent } from '@src/type/model';
import { DashboardStore } from '@src/model/dashboard';
import { CloudAppMessages } from '@src/schema/socket/CloudAppMessages';
import { HumanVerify } from '@src/schema/socket/HumanVerify';
import { AppCategory } from '@src/schema/AppConfig';

/**
 * 属性
 */
export interface Prop extends Partial<StoreComponent> {
    /**
     * CloudCodeModal仓库State
     */
    cloudCodeModal: CloudCodeModalStoreState,
    /**
     * Dashboard仓库State
     */
    dashboardModal: DashboardStore,
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
    app: CloudAppMessages,
    /**
     * 显示/关闭图形验证框handle
     * @param data 图形验证数据
     * @param isUrl 是否是地址
     * @param appId 云取应用id
     * @param appDesc 云取应用名称
     */
    humanVerifyDataHandle: (data: HumanVerify | string | null, isUrl: boolean, appId: string, appDesc: string) => void,
    /**
     * 云取应用
     */
    cloudApps: AppCategory[],
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