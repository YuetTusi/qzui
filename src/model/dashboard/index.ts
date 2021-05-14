import { Model } from 'dva';
import SendCase from '@src/schema/platform/GuangZhou/SendCase';
import Officer from '@src/schema/Officer';
import { AlarmMessageInfo } from '@src/components/AlarmMessage/componentType';
import reducers from './reducers';
import effects from './effects';
import subscriptions from './subscriptions';
import { AppCategory } from '@src/schema/AppConfig';

interface DashboardStore {
    /**
     * 接收平台案件数据
     */
    sendCase: SendCase | null,
    /**
     * 接收警综采集人员
     */
    sendOfficer: Officer[],
    /**
     * 全局警告消息，无消息为空数组
     */
    alertMessage: AlarmMessageInfo[],
    /**
     * 云取应用数据
     */
    cloudAppData: AppCategory[]
}

/**
 * 首个加载的Model
 * #在此统一处理全局性操作
 */
let model: Model = {
    namespace: 'dashboard',
    state: {
        sendCase: null,
        sendOfficer: [],
        alertMessage: [],
        cloudAppData: []
    },
    reducers,
    effects,
    subscriptions
}

export { DashboardStore };
export default model;