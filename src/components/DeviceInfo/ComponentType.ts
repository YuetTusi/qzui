import { DeviceType } from '@src/schema/socket/DeviceType';
import { PhoneSystem } from '@src/schema/socket/PhoneSystem';

export interface Prop extends DeviceType {
    /**
     * 取证回调方法
     */
    collectHandle: (arg0: any) => void;
    /**
     * 云取证回调方法
     */
    serverCloudHandle: (arg0: any) => void;
    /**
     * 异常记录回调方法
     */
    errorHandle: (arg0: any) => void;
    /**
     * 停止采集回调方法
     */
    stopHandle: (arg0: any) => void;
    /**
     * 手机连接帮助Handle
     */
    userHelpHandle: (arg0: PhoneSystem) => void;
    /**
     * 手机投屏handle
     */
    screenCastHandle: (arg0: any) => void;
}