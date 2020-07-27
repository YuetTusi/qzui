import FetchRecord from "@src/schema/socket/FetchRecord";

/**
 * 属性
 */
export interface Prop {
    /**
     * 是否显示
     */
    visible: boolean;
    /**
     * USB序号
     */
    usb: number;
    /**
     * 标题
     */
    title?: string;
    /**
     * 取消回调
     */
    cancelHandle?: () => void;
};

export interface EventMessage {
    /**
     * 当前消息所属设备序号
     */
    usb: number;
    /**
     * 采集记录
     */
    fetchRecord: FetchRecord;
}