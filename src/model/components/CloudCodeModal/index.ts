import { Model } from 'dva';
import reducers from './reducers';
import effects from './effects';

interface CloudCodeModalStoreState {
    /**
     * 云取证应用输入项
     */
    apps: AppCodeItem[]
}

interface AppCodeItem {
    /**
     * 应用ID
     */
    m_strID: string,
    /**
     * 应用包名
     */
    m_strPktlist: string[],
    /**
     * 详情消息
     */
    message: string
}

/**
 * 云取证验证码输入框
 */
let model: Model = {
    namespace: 'cloudCodeModal',
    state: {
        apps: []
    },
    reducers,
    effects
}

export { CloudCodeModalStoreState, AppCodeItem };
export default model;