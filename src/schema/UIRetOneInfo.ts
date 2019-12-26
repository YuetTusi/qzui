
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
    
    constructor(props: any = {}) {
        this.strCase_ = props.strCase_ || '';
        this.strPhone_ = props.strPhone_ || '';
        this.status_ = props.status_ || 1;
    }
}