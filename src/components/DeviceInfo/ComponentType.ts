import { DeviceType } from '@src/schema/socket/DeviceType';

export interface Prop extends DeviceType {
    /**
     * 当前是否有正在采集的手机
     */
    hasFetching?: boolean;
    /**
     * 采集回调方法
     */
    collectHandle: (arg0: any) => void;
    /**
     * 停止采集回调方法
     */
    stopHandle: (arg0: any) => void;
}

export interface State {
    /**
     * 当前组件时钟
     */
    clock: string;
};