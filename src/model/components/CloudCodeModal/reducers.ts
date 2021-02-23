import { AnyAction } from 'redux';
import { CloudCodeModalStoreState } from '.';

export default {
    /**
     * 设置显示隐藏弹框
     * @param {boolean} payload.visible
     * @param {number} payload.usb
     * @param {AppCodeItem[]} payload.apps
     */
    setVisible(state: CloudCodeModalStoreState, { payload }: AnyAction) {
        state.usb = payload.usb;
        state.apps = payload.apps;
        state.visible = payload.visible;
        return state;
    },
    /**
     * 设置应用详情（全部）
     * @param {number} payload.usb 序号
     * @param {any[]} payload.list 详情列表
     */
    setMessages(state: CloudCodeModalStoreState, { payload }: AnyAction) {

        const { list } = payload as { usb: number, list: any[] };
        state.apps = state.apps.map(app => {
            let next = list.find((item) => item.appId === app.m_strID)
            if (next) {
                return { ...app, message: next.message };
            } else {
                return app;
            }
        });
        return state;
    },
    /**
     * 更新应用详情
     * @param {MessageParam} payload
     */
    updateMessage(state: CloudCodeModalStoreState, { payload }: AnyAction) {

        const { m_strID, message } = payload as { m_strID: string, message: string };

        state.apps = state.apps.map(app => {
            if (app.m_strID === m_strID) {
                return { ...app, message };
            } else {
                return app;
            }
        });
        return state;
    }
}