import { FetchState, ParseState } from './DeviceState';
import { BaseEntity } from '../db/BaseEntity';
import FetchRecord from './FetchRecord';

/**
 * 手机设备类型
 */
class DeviceType extends BaseEntity {
    /**
     * 唯一标识uuid
     */
    id?: string;
    /**
     * 命令
     */
    cmd?: string;
    /**
     * 类型(区分socket分类)
     */
    type?: string;
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
    usb?: number;
    /**
     * 采集状态
     */
    fetchState?: FetchState;
    /**
     * 解析状态
     */
    parseState?: ParseState;
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
    fetchType?: string[];
    /**
     * 采集时间
     */
    fetchTime?: Date;
    /**
     * 解析时间
     */
    parseTime?: Date;
    /**
     * 采集记录
     */
    fetchRecord?: FetchRecord[] = [];
}

export { DeviceType };
export default DeviceType;