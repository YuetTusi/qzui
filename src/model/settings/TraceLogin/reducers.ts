import { AnyAction } from 'redux';
import { TraceLoginState } from '.';

export default {
    /**
     * 更新剩余次数
     */
    setLimitCount(state: TraceLoginState, { payload }: AnyAction) {
        state.limitCount = payload;
        return state;
    },
    /**
     * 更新登录状态
     */
    setLoginState(state: TraceLoginState, { payload }: AnyAction) {
        state.loginState = payload;
        return state;
    },
    /**
     * 更新登录消息
     */
    setLoginMessage(state: TraceLoginState, { payload }: AnyAction) {
        state.loginMessage = payload;
        return state;
    },
    /**
     * 更新用户信息
     */
    setUser(state: TraceLoginState, { payload }: AnyAction) {
        state.username = payload.username;
        state.password = payload.password;
        state.remember = payload.remember;
        return state;
    }
};