import Base from './Base';
import { DeviceState } from './DeviceState';

/**
 * 手机设备类型
 */
interface DeviceType extends Base {
    /**
     * 手机品牌
     */
    brand?: string;
    /**
     * 手机型号
     */
    model?: string;
    /**
     * 系统类型
     */
    system?: string;
    /**
     * USB序号
     */
    usb?: string;
    /**
     * 连接状态
     */
    state?: DeviceState;
}

export { DeviceType };
export default DeviceType;