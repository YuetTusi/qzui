import GuideImage from "./GuideImage";

/**
 * 消息类型
 */
enum TipType {
    /**
     * 无消息
     */
    Nothing = 'nothing',
    /**
     * 重要消息（闪烁）
     */
    Flash = 'flash',
    /**
     * 一般消息
     */
    Normal = 'normal'
}

/**
 * 采集程序Fetch配置的按钮
 */
interface ReturnButton {
    /**
     * 按钮文本
     */
    name: string;
    /**
     * 返回值
     */
    value: any;
    /**
     * 确认文案
     */
    confirm?: string;
}

/**
 * Socket Tip消息类型
 */
interface TipParams {
    /**
     * 消息所属USB序号
     */
    usb: number;
    /**
     * 消息标题
     */
    title: string;
    /**
     * 消息内容
     */
    content?: string;
    /**
     * 消息图示
     */
    image?: GuideImage;
    /**
     * 按钮区
     */
    buttons: ReturnButton[];
    /**
     * 是否必须回复
     */
    required: boolean;
    /**
     * 是否闪烁
     */
    flash: boolean;
}

export { TipType, TipParams, ReturnButton };
export default TipType;