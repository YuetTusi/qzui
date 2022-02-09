import { BaseEntity } from "./db/BaseEntity";


/**
 * 登录用户
 */
class TraceUser extends BaseEntity {

    /**
     * 用户名
     */
    username: string;
    /**
     * 密码
     */
    password: string;
    /**
     * 是否保持状态
     */
    remember: boolean;

    constructor(props: any = {}) {
        super();
        this.username = props.username || '';
        this.password = props.password || '';
        this.remember = props.remember || false;
    }
}

export { TraceUser };
export default TraceUser;