import { CloudApp } from "../CloudApp";
import { HumanVerify } from "./HumanVerify";

class CloudAppMessages extends CloudApp {
    /**
     * 详情消息
     */
    message: CaptchaMsg[];
    /**
     * 是否禁用
     */
    disabled: boolean;
    /**
     * 云取应用状态
     */
    state: CloudAppState;
    /**
     * 图形验证数据（为空无验证消息）
     */
    humanVerifyData: HumanVerify | null;

    constructor(props: any) {
        super();
        this.m_strID = props.m_strID ?? '';
        this.name = props.name ?? '';
        this.key = props.appKey ?? '';
        this.message = props.message ?? [];
        this.disabled = props.disabled ?? false;
        this.state = props.state ?? CloudAppState.Fetching;
        this.humanVerifyData = props.humanVerifyData ?? null;
    }
}

/**
 * 云取应用状态枚举
 */
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

export { CaptchaMsg, CloudAppState, CloudAppMessages };