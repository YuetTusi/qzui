
/**
 * 数据解析结构体
 */
export class UIRetOneInfo {
    /**
     * 案件名称
     */
    public strCase_?: string;
    /**
     * 手机
     */
    public strPhone_?: string;
    /**
     * 状态（0:解析完成 1:未解析 2:解析中）
     */
    public status_?: number;

    /**
     * 手机持有人
     */
    public DeviceHolder_?: string;

    /**
     * 设备编号
     */
    public DeviceNumber_?: string;
    /**
     * 手机存储的路径（绝对路径）
     */
    public PhonePath_?: string;
    /**
     * 采集详情
     */
    public strdetails_?: string;

    constructor(props: any = {}) {
        this.strCase_ = props.strCase_ || '';
        this.strPhone_ = props.strPhone_ || '';
        this.status_ = props.status_ || 1;
        this.DeviceHolder_ = props.DeviceHolder_ || '';
        this.DeviceNumber_ = props.DeviceNumber_ || '';
        this.PhonePath_ = props.PhonePath_ || '';
        this.strdetails_ = props.strdetails_ || '';
    }
}