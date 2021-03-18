import { AnyAction } from 'redux';
import { helper } from '@utils/helper';
import { CaptchaMsg } from '@src/components/guide/CloudCodeModal/CloudCodeModalType';
import { CloudAppMessages, CloudAppState } from '@src/schema/socket/CloudAppMessages';
import { CloudCodeModalStoreState } from '.';

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
     * 设置云取应用
     * @param {number} payload.usb USB序号
     * @param {string} payload.mobileHolder 持有人
     * @param {string} payload.mobileNumber 手机号
     * @param {CloudApp[]} payload.apps 云取应用
     */
    setApps(state: CloudCodeModalStoreState, { payload }: AnyAction) {
        let { usb, mobileHolder, mobileNumber, apps } = payload as { usb: number, mobileHolder: string, mobileNumber: string, apps: CloudAppMessages[] };
        let current = state.devices[usb - 1];
        apps = apps.map((app) => {
            app.message = app.message ?? [];
            app.disabled = app.disabled ?? true;
            app.state = app.state ?? CloudAppState.Fetching;
            return app;
        });
        if (helper.isNullOrUndefined(current)) {
            current = {
                apps
            };
        } else {
            current.apps = apps;
        }
        state.devices[usb - 1] = current;
        state.mobileHolder = mobileHolder;
        state.mobileNumber = mobileNumber;
        return state;
    },
    /**
     * 清理设备下的云取应用记录
     * @param {number} payload USB序号
     */
    clearApps(state: CloudCodeModalStoreState, { payload }: AnyAction) {
        (state.devices[payload - 1] as any) = undefined;
        state.usb = 0;
        state.mobileHolder = '';
        state.mobileNumber = '';
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
            state.devices[usb - 1] = current;
        }

        return state;
    },
    /**
     * 设置禁用状态
     * @param {number} payload.usb USB序号
     * @param {string} payload.m_strID 要禁用或启用的应用id
     * @param {boolean} payload.disabled 是否禁用
     */
    setDisabled(state: CloudCodeModalStoreState, { payload }: AnyAction) {
        const { usb, m_strID, disabled } = payload as { m_strID: string, disabled: boolean, usb: number };
        let current = state.devices[usb - 1]; //当前设备

        if (current) {
            current.apps = current.apps.map((app) => {
                if (app.m_strID === m_strID) {
                    app.disabled = disabled;
                }
                return app;
            });
            state.devices[usb - 1] = current;
        }
        return state;
    },
    /**
     * 设置云取应用成功状态
     * @param {number} payload.usb 序号
     * @param {CloudApp[]} payload.apps Fetch返回的云取应用列表
     */
    setState(state: CloudCodeModalStoreState, { payload }: AnyAction) {

        const { usb, apps } = payload as { usb: number, apps: CloudAppMessages[] };
        let current = state.devices[usb - 1];

        if (current) {
            current.apps = current.apps.map((app: CloudAppMessages) => {
                const next = apps.find((item) => item.m_strID === app.m_strID);
                if (next) {
                    app.state = next.state;
                }
                return app;
            });
            state.devices[usb - 1] = current;
        }

        return state;
    }
}