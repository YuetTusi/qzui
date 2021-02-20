import { AnyAction } from 'redux';
import { CloudCodeModalStoreState } from '.';

export default {
    /**
     * 设置应用验证码输入项
     * @param {AppCodeItem[]} payload 
     */
    setApps(state: CloudCodeModalStoreState, { payload }: AnyAction) {
        state.apps = payload;
        return state;
    },
    /**
     * 更新应用详情
     * @param {string} payload.m_strID 应用id
     * @param {string} payload.message 详情消息
     */
    updateMessage(state: CloudCodeModalStoreState, { payload }: AnyAction) {

        const { m_strID, message } = payload;

        state.apps = state.apps.map(app => {
            if (app.m_strID === m_strID) {
                return { ...app, message };
            }else{
                return app;
            }
        });
        return state;
    }
}