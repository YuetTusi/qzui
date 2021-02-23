import { Model } from 'dva';
import reducers from './reducers';
import effects from './effects';
import { CParseApp } from '@src/schema/CParseApp';
import DeviceType from '@src/schema/socket/DeviceType';

interface CloudCodeModalStoreState {
    /**
     * 是否显示
     */
    visible: boolean,
    /**
     * 云取证应用输入项
     */
    usb: number,
    /**
     * 云取证应用输入项
     */
    apps: AppCodeItem[]
}

interface AppCodeItem {
    /**
     * AppID
     */
    m_strID: string,
    /**
     * App包名列表
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
        visible: false,
        usb: 0,
        apps: []
    },
    reducers,
    effects
}

export { CloudCodeModalStoreState, AppCodeItem };
export default model;