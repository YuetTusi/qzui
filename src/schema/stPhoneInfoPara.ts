/**
 * 手机数据结构
 * 对应后端结构体类型 struct stPhoneInfoPara{}
 */
export class stPhoneInfoPara {
    //手机品牌
    public piMakerName?: string;
    //型号
    public piPhoneType?: string;
    //系统类型 1:安卓 2:iOS
    public piSystemType?: number;
    //设备名称
    public piDeviceName?: string;
    //序列号
    public piSerialNumber?: string;
    //物理USB端口
    public piLocationID?: string;
    public m_bIsConnect?: boolean;
    public piAndroidVersion?: string;
    public piCOSName?: string;
    public piCOSVersion?: string;
    public piSystemVersion?: string;
    public dtSupportedOpt?: number;

    constructor(props: any = {}) {
        this.piMakerName = props.piMakerName || '';
        this.piPhoneType = props.piPhoneType || '';
        this.piSystemType = props.piSystemType || 0;
        this.m_bIsConnect = props.m_bIsConnect || false;
        this.piAndroidVersion = props.piAndroidVersion || '';
        this.piCOSName = props.piCOSName || '';
        this.piDeviceName = props.piDeviceName || '';
        this.piSerialNumber = props.piSerialNumber || '';
        this.piSystemVersion = props.piSystemVersion || '';
        this.dtSupportedOpt = props.dtSupportedOpt || 0;
        this.piLocationID = props.piLocationID || '';
    }
}