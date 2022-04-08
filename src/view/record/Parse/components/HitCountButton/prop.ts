import { Dispatch } from 'redux';

export interface HitCountButtonProp {

    /**
     * 设备id
     */
    deviceId: string,

    /**
     * 派发方法
     */
    dispatch: Dispatch<any>
}