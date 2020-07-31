import DeviceType from "@src/schema/socket/DeviceType";

interface Prop extends DeviceType {
    /**
     * 是否显示
     */
    visible: boolean;
    /**
     * 是回调
     */
    yesHandle: (value: any, data: DeviceType) => void;
    /**
     * 否回调
     */
    noHandle: (value: any, data: DeviceType) => void;
    /**
     * 关闭回调（点右上角叉）
     */
    cancelHandle: () => void;
};

export { Prop };