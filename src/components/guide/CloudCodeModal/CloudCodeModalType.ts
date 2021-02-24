import { CloudCodeModalStoreState } from '@src/model/components/CloudCodeModal';
import { CParseApp } from '@src/schema/CParseApp';
import DeviceType from '@src/schema/socket/DeviceType';
import { StoreComponent } from '@src/type/model';

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
     * 应用id
     */
    m_strID: string,
    /**
     * 应用包名
     */
    m_strPktlist: string[],
    /**
     * 详情消息
     */
    message: CaptchaMsg[]
}