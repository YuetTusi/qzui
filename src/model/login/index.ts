import { Model } from 'dva';
import reducers from './reducers';
import effects from './effects';

interface LoginStoreState {
    /**
     * 注册用户窗口打开/关闭
     */
    registerUserModalVisible: boolean,
    /**
     * 错误次数
     */
    mistake: number,
    /**
     * 加载中
     */
    loading: boolean
}

let model: Model = {

    namespace: 'login',
    state: {
        registerUserModalVisible: false,
        user: null,
        mistake: 0,
        loading: false
    },
    reducers,
    effects,
};

export { LoginStoreState }
export default model;