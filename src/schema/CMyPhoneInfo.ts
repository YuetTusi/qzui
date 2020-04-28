/**
 * 案件下手机数据
 */
class CMyPhoneInfo {
    /**
     * 手机路径
     */
    public m_strPhoneName: string = '';
    /**
     * 持有人
     */
    public m_strDeviceHolder: string = '';
    /**
     * 设备编号
     */
    public m_strDeviceNumber: string = '';

    constructor(props: any = {}) {
        this.m_strPhoneName = props.m_strPhoneName || '';
        this.m_strDeviceHolder = props.m_strDeviceHolder || '';
        this.m_strDeviceNumber = props.m_strDeviceNumber || '';
    }
}

export { CMyPhoneInfo };
export default CMyPhoneInfo;