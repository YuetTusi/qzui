import { CParseApp } from "../CParseApp";

class CloudApp extends CParseApp {
    /**
     * 详情消息
     */
    message: CaptchaMsg[];
    /**
     * 是否禁用
     */
    disabled: boolean;
    /**
     * 是否成功
     */
    state: CloudAppState;

    constructor(props: any) {
        super();
        this.m_strID = props.m_strID ?? '';
        this.m_strPktlist = props.m_strPktlist ?? [];
        this.name = props.name ?? '';
        this.key = props.appKey ?? '';
        this.message = props.message ?? [];
        this.disabled = props.disabled ?? false;
        this.state = props.state ?? CloudAppState.Fetching;
    }
}

enum CloudAppState {
    /**
     * 采集中
     */
    Fetching,
    /**
     * 成功
     */
    Success,
    /**
     * 失败
     */
    Error
}

/**
 * 验证码进度消息（一条）
 */
interface CaptchaMsg {
    /**
     * 内容
     */
    content: string,
    /**
     * 类型
     */
    type: number,
    /**
     * 消息时间
     */
    actionTime: Date
}

export { CaptchaMsg, CloudAppState, CloudApp };