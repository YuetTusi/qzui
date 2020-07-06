import Base from './Base';
import { FetchState } from './DeviceState';
import { BaseEntity } from '../db/BaseEntity';

/**
 * 手机设备类型
 */
interface DeviceType extends Base, BaseEntity {
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
    fetchState?: FetchState;
    /**
     * 检验员
     */
    checker?: string;
    /**
     * 检验员编号
     */
    checkerNo?: string;
    /**
     * 手机名称
     */
    mobileName?: string;
    /**
     * 手机编号
     */
    mobileNo?: string;
    /**
     * 手机持有人
     */
    mobileHolder?: string;
    /**
     * 采集方式
     */
    fetchType?: any;

}

export { DeviceType };
export default DeviceType;