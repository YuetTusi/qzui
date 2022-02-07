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
     * 用户名
     */
    username?: string,
    /**
     * 密码
     */
    password?: string
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
    LoginError
}

let model: Model = {
    namespace: 'traceLogin',
    state: {
        limitCount: 0,
        loginState: LoginState.NotLogin,
        username: undefined,
        password: undefined
    },
    reducers,
    effects
}

export { TraceLoginState, LoginState };
export default model;