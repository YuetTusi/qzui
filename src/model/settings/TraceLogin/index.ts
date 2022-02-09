import { Model } from 'dva';
import effects from './effects';
import reducers from './reducers';

interface TraceLoginState {
    /**
     * 剩余次数
     */
    limitCount: number,
    /**
     * 登录状态
     */
    loginState: LoginState,
    /**
     * 消息
     */
    loginMessage: string,
    /**
     * 用户名
     */
    username?: string,
    /**
     * 密码
     */
    password?: string,
    /**
     * 是否保持登录状态
     */
    remember: boolean
}

/**
 * 状态枚举
 */
enum LoginState {
    /**
     * 未登录
     */
    NotLogin,
    /**
     * 已登录
     */
    IsLogin,
    /**
     * 登录失败
     */
    LoginError,
    /**
     * 登录中
     */
    Busy
}

let model: Model = {
    namespace: 'traceLogin',
    state: {
        limitCount: 0,
        loginState: LoginState.NotLogin,
        loginMessage: '尚未登录',
        username: undefined,
        password: undefined,
        remember: false
    },
    reducers,
    effects
}

export { TraceLoginState, LoginState };
export default model;