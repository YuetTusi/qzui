
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
     * 状态（0:失败 1:成功 10:未解析(手动) 11:解析中）
     */
    public status_?: ParsingStatus;

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
    /**
     * -1:读取异常 0:不生成BCP 1:生成BCP
     */
    public nBcp_?: number;
    /**
     * 是否带有附件 -1读取异常 0:无附件 1:有附件
     */
    public nContainAttach_?: number;

    constructor(props: any = {}) {
        this.strCase_ = props.strCase_ || '';
        this.strPhone_ = props.strPhone_ || '';
        this.status_ = props.status_ || 10;
        this.DeviceHolder_ = props.DeviceHolder_ || '';
        this.DeviceNumber_ = props.DeviceNumber_ || '';
        this.PhonePath_ = props.PhonePath_ || '';
        this.strdetails_ = props.strdetails_ || '';
        this.nBcp_ = props.isBcp＿ || -1;
        this.nContainAttach_ = props.nContainAttach_ || -1;
    }
}
/**
 * 解析状态枚举
 */
export enum ParsingStatus {
    /**
     * 失败
     */
    FAILURE = 0,
    /**
     * 成功
     */
    SUCCESS = 1,
    /**
     * 未解析(手动)
     */
    UNCOMPLETE = 10,
    /**
     * 解析中
     */
    PARSING = 11
}