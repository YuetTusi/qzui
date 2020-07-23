import DeviceType from "@src/schema/socket/DeviceType";

interface Prop {
    /**
     * 设备数据
     */
    data?: DeviceType;
    /**
     * 终端编号
     */
    no: number;
    /**
     * 采集handle
     */
    collectHandle: (arg0: DeviceType) => void;
    /**
     * 采集记录handle
     */
    errorHandle: (arg0: DeviceType) => void;
    /**
     * 停止采集handle
     */
    stopHandle: (arg0: DeviceType) => void;
    /**
     * 消息链接handle
     */
    msgLinkHandle: (arg0: DeviceType) => void;
};

export { Prop };