import { stPhoneInfoPara } from "@src/schema/stPhoneInfoPara";
import { PhoneInfoStatus } from "./PhoneInfoStatus";
import SystemType from "@src/schema/SystemType";

export interface Prop extends stPhoneInfoPara {
    /**
     * 组件索引
     */
    index: number;
    /**
     * 采集状态
     */
    status: PhoneInfoStatus;
    /**
     * 打开USB调试链接回调
     * @param arg0 系统类型
     */
    usbDebugHandle?: (arg0: SystemType) => void;
    /**
     * 采集回调方法
     */
    collectHandle: (arg0: any) => void;
    /**
     * 详情回调方法
     */
    detailHandle: (arg0: stPhoneInfoPara) => void;
    /**
     * 停止采集回调方法
     */
    stopHandle: (arg0: stPhoneInfoPara) => void;
}

export interface State {
    /**
     * 当前组件时钟
     */
    clock: string;
};