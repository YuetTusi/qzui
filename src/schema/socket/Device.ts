import Base from './Base';

/**
 * 手机设备类型
 */
interface Device extends Base {
    /**
     * 手机品牌
     */
    brand: string;
    /**
     * 手机型号
     */
    model: string;
    /**
     * 系统类型
     */
    system: string;
}

export { Device };
export default Device;