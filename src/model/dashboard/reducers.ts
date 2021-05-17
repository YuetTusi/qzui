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
    }
};