import { AnyAction } from 'redux';
import { CaptchaMsg } from '@src/components/guide/CloudCodeModal/CloudCodeModalType';
import { CloudCodeModalStoreState, OneCloudApp } from '.';
import { helper } from '@src/utils/helper';

export default {
    /**
     * 设置显示隐藏弹框
     * @param {boolean} payload.visible
     * @param {number} payload.usb 设备USB序号
     */
    setVisible(state: CloudCodeModalStoreState, { payload }: AnyAction) {
        state.visible = payload.visible;
        state.usb = payload.usb;
        return state;
    },
    /**
     * 设置应用
     * @param {number} payload.usb 序号
     * @param {OneCloudApp[]} payload.apps 应用
     */
    setApps(state: CloudCodeModalStoreState, { payload }: AnyAction) {
        const { usb, apps } = payload as { usb: number, apps: OneCloudApp[] };
        let current = state.devices[usb - 1];
        if (helper.isNullOrUndefined(current)) {
            current = { apps };
            state.devices[usb - 1] = current;
        }
        return state;
    },
    /**
     * 清理设备下的云取应用记录
     * @param {number} payload USB序号
     */
    clearApps(state: CloudCodeModalStoreState, { payload }: AnyAction) {
        (state.devices[payload - 1] as any) = undefined;
        return state;
    },
    /**
     * 追加应用详情
     * @param {number} payload.usb USB序号
     * @param {string} payload.m_strID 应用id
     * @param {CaptchaMsg} payload.message CaptchaMsg一条进度消息
     */
    appendMessage(state: CloudCodeModalStoreState, { payload }: AnyAction) {

        const { usb, m_strID, message } = payload as { usb: number, m_strID: string, message: CaptchaMsg };
        let current = state.devices[usb - 1]; //当前设备

        if (current?.apps) {
            current.apps = current.apps.map(app => {
                if (app.m_strID === m_strID) {
                    app.message = app.message ?? [];
                    app.message.push(message);
                }
                return app;
            });
        } else {
            current = {
                apps: [
                    {
                        m_strID,
                        m_strPktlist: [],
                        message: [message]
                    }
                ]
            };
        }

        state.devices[usb - 1] = current;

        return state;
    }
}