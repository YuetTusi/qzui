import { AnyAction } from 'redux';
import { LoginStoreState } from '.';

export default {
    /**
     * 注册用户打开/关闭
     */
    setRegisterUserModalVisible(state: LoginStoreState, { payload }: AnyAction) {
        state.registerUserModalVisible = payload;
        return state;
    },
    /**
     * 更新错误次数
     */
    setMistake(state: LoginStoreState, { payload }: AnyAction) {
        state.mistake = payload;
        return state;
    },
    /**
     * 更新loading
     */
    setLoading(state: LoginStoreState, { payload }: AnyAction) {
        state.loading = payload;
        return state;
    }
};