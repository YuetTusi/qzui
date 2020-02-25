import { ConnectSate } from './ConnectState';
import { SystemType } from './SystemType';
import { PhoneUserType } from './PhoneUserType';
import { FetchResposeUI } from './FetchResposeUI';
/**
 * 手机数据结构
 * 对应后端结构体类型 struct stPhoneInfoPara{}
 */
export class stPhoneInfoPara {
    /**
     * 设备状态
     */
    public m_ConnectSate?: ConnectSate;
    /**
     * 系统类型
     */
    public piSystemType?: SystemType;
    /**
     * 设备厂商名
     */
    public piMakerName?: string;
    /**
     * 手机品牌
     */
    public piBrand?: string;
    /**
     * 型号
     */
    public piModel?: string;
    /**
     * 系统类型
     */
    public piSystemVersion?: string;
    /**
     * 安卓版本
     */
    public piAndroidVersion?: string;
    /**
     * 设备名称
     */
    public piDeviceName?: string;
    /**
     * 序列号
     */
    public piSerialNumber?: string;
    /**
     * 物理USB端口
     */
    public piLocationID?: string;
    /**
     * 手机厂商定制的系统名称
     */
    public piCOSName?: string;
    /**
     * 手机厂商定制的系统版本号
     */
    public piCOSVersion?: string;
    /**
     * USB序号（用户插入USB接口号）
     */
    public m_nOrder?: number;
    /**
     * 设备状态数据
     */
    public m_ResponseUI?: FetchResposeUI;
    public piCpuAbi?: string;
    public piBoard?: string;
    public piHardware?: string;
    public piDevice?: string;
    public piName?: string;
    /**
     * 设备用户列表 0:隐私空间 1：应用分身
     */
    public piUserlist?: PhoneUserType[];

    constructor(props: any = {}) {
        this.m_ConnectSate = props.m_ConnectSate || ConnectSate.NOT_CONNECT;
        this.piSystemType = props.piSystemType || SystemType.ANDROID;
        this.piMakerName = props.piMakerName || '';
        this.piBrand = props.piBrand || '';
        this.piModel = props.piModel || '';
        this.piAndroidVersion = props.piAndroidVersion || '';
        this.piCOSName = props.piCOSName || '';
        this.piCOSVersion = props.piCOSVersion || '';
        this.piDeviceName = props.piDeviceName || '';
        this.piSerialNumber = props.piSerialNumber || '';
        this.piSystemVersion = props.piSystemVersion || '';
        this.piLocationID = props.piLocationID || '';
        this.piCpuAbi = props.piCpuAbi || '';
        this.piBoard = props.piBoard || '';
        this.piHardware = props.piHardware || '';
        this.piDevice = props.piDevice || '';
        this.piName = props.piName || '';
        this.m_nOrder = props.m_nOrder || 0;
        this.piUserlist = props.piUserlist || [];
    }
}