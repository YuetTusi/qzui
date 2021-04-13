import { Dispatch } from 'redux';
import { HumanVerify } from "@src/schema/socket/HumanVerify";


/**
 * 属性
 */
interface Prop {
    /**
     * 是否显示
     */
    visible: boolean,
    /**
     * USB序号
     */
    usb: number,
    /**
     * 应用id
     */
    appId: string,
    /**
     * 标题
     */
    title: string,
    /**
     * 图形验证数据
     */
    humanVerifyData: HumanVerify | null,
    /**
     * 显示handle
     */
    closeHandle: () => void,
    /**
     * ReduxDispath
     */
    dispatch: Dispatch<any>
}

export { Prop };