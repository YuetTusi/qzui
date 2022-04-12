import { Dispatch } from 'redux';
import DeviceType from '@src/schema/socket/DeviceType';

export interface HitCountButtonProp {

    /**
     * 设备数据
     */
    data: DeviceType,

    /**
     * 派发方法
     */
    dispatch: Dispatch<any>
}