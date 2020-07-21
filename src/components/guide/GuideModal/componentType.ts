import DeviceType from "@src/schema/socket/DeviceType";

interface Prop extends DeviceType {
    /**
     * 是否显示
     */
    visible: boolean;
    /**
     * 标题文字
     */
    title?: string;
    /**
     * 是回调
     */
    yesHandle: (data: DeviceType) => void;
    /**
     * 否回调
     */
    noHandle: (data: DeviceType) => void;
    /**
     * 关闭回调（右上角关闭）
     */
    cancelHandle: (data: DeviceType) => void;
};

export { Prop };