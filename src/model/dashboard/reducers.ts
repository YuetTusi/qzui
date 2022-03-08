import { AlarmMessageInfo } from '@src/components/AlarmMessage/componentType';
import { AnyAction } from 'redux';
import { DashboardStore } from ".";

export default {
    /**
     * 设置警综平台数据
     * @param {SendCase | null} payload 平台数据，清空数据传null
     */
    setSendCase(state: DashboardStore, { payload }: AnyAction) {
        state.sendCase = payload;
        return state;
    },
    /**
     * 设置警综平台采集人员
     * @param {Officer} payload 采集人员对象
     */
    setSendOfficer(state: DashboardStore, { payload }: AnyAction) {
        state.sendOfficer = [payload];
        return state;
    },
    /**
     * 添加全局提示消息
     * @param {AlarmMessageInfo} payload 消息内容（一条）
     */
    addAlertMessage(state: DashboardStore, { payload }: AnyAction) {
        state.alertMessage.push(payload);
        return state;
    },
    /**
     * 更新全局消息
     * @param {AlarmMessageInfo} payload 消息内容（一条）
     */
    updateAlertMessage(state: DashboardStore, { payload }: AnyAction) {
        const { id, msg } = payload as AlarmMessageInfo;
        state.alertMessage = state.alertMessage.map(item => {
            if (item.id === id) {
                item.msg = msg;
                return item;
            } else {
                return item;
            }
        });
        return state;
    },
    /**
     * 删除id的消息
     * @param {string} payload 唯一id
     */
    removeAlertMessage(state: DashboardStore, { payload }: AnyAction) {
        const next = state.alertMessage.filter(i => i.id !== payload);
        state.alertMessage = next;
        return state;
    },
    /**
     * 设置云取应用数据
     * @param {AppCategory[]} payload
     */
    setCloudAppData(state: DashboardStore, { payload }: AnyAction) {
        state.cloudAppData = payload;
        return state;
    },
    /**
     * 设置应用输入项值
     * @param {string} payload.app_id 应用id
     * @param {string} paylaod.name 名称
     * @param {string} payload.value 值
     */
    setExtValue(state: DashboardStore, { payload }: AnyAction) {

        state.cloudAppData = state.cloudAppData.map(category => {
            category.app_list = category.app_list.map(app => {
                if (app.app_id === payload.app_id && app.ext !== undefined) {
                    for (let i = 0; i < app.ext.length; i++) {
                        if (app.ext[i].name === payload.name) {
                            app.ext[i].value = payload.value;
                            break;
                        }
                    }
                }
                return app;
            });
            return category;
        });
        return state;
    },
    /**
     * 清空所有输入参数的值
     */
    clearExtValue(state: DashboardStore, { }: AnyAction) {
        state.cloudAppData = state.cloudAppData.map(category => {
            category.app_list = category.app_list.map((app) => {
                if (app.ext && app.ext.length > 0) {
                    app.ext = app.ext.map(item => ({ ...item, value: '' }));
                }
                return app;
            });
            return category;
        });
        return state;
    }
};