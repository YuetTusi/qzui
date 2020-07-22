import { AnyAction } from 'redux';
import { Model, EffectsCommandMap } from 'dva';
import { routerRedux } from 'dva/router';
import { CCaseInfo } from '@src/schema/CCaseInfo';
import Db from '@utils/db';
import apps from '@src/config/app.yaml';
import message from 'antd/lib/message';
import UserHistory, { HistoryKeys } from '@src/utils/userHistory';
import { TableName } from '@src/schema/db/TableName';

interface StoreState {
    /**
     * 当前编辑的案件对象
     */
    data: ExtendCaseInfo;
    /**
     * 保存状态
     */
    saving: boolean;
}

/**
 * 扩展App属性，用于绑定App组件
 */
class ExtendCaseInfo extends CCaseInfo {
    apps: any[] = [];
}

/**
 * 案件编辑model
 */
let model: Model = {
    namespace: 'caseEdit',
    state: {
        data: { apps: apps.fetch },
        saving: false
    },
    reducers: {
        /**
         * 设备是否手动勾选App
         */
        setChooiseApp(state: StoreState, { payload }: AnyAction) {
            state.data.chooiseApp = payload;
            return state;
        },
        /**
         * 设置是否自动解析值（true或false）
         */
        setAutoParse(state: StoreState, { payload }: AnyAction) {
            state.data.m_bIsAutoParse = payload;
            state.data.m_bIsAttachment = false;
            return state;
        },
        /**
         * 设置是否生成BCP（true或false）
         */
        setGenerateBCP(state: StoreState, { payload }: AnyAction) {
            state.data.m_bIsGenerateBCP = payload;
            state.data.m_bIsAttachment = false;
            return state;
        },
        /**
         * 将BCP输入的相关字段置空
         */
        setBcpInputEmpty(state: StoreState, { payload }: AnyAction) {
            state.data.m_strCaseNo = '';
            state.data.m_strCaseType = '';
            state.data.m_strCaseType = '100';
            state.data.m_strBCPCaseName = '';
            state.data.m_strGaCaseNo = '';
            state.data.m_strGaCaseType = '';
            state.data.m_strGaCaseName = '';
            state.data.m_strGaCasePersonNum = '';
            return state;
        },
        /**
         * 设置是否带有附件
         */
        setAttachment(state: StoreState, { payload }: AnyAction) {
            state.data.m_bIsAttachment = payload;
            return state;
        },
        setData(state: StoreState, { payload }: AnyAction) {
            state.data = payload;
            return state;
        },
        setSaving(state: StoreState, { payload }: AnyAction) {
            state.saving = payload;
            return state;
        }
    },
    effects: {
        /**
         * 传id查询案件记录
         */
        *queryCaseById({ payload }: AnyAction, { call, put }: EffectsCommandMap) {
            const db = new Db<CCaseInfo>(TableName.Case);
            try {
                let data: ExtendCaseInfo = yield call([db, 'findOne'], { _id: payload });
                let { fetch } = apps;
                for (let i = 0; i < fetch.length; i++) {
                    for (let j = 0, len = fetch[i].app_list.length; j < len; j++) {
                        if (data.m_Applist.find(item => item.m_strID == fetch[i].app_list[j].app_id) === undefined) {
                            fetch[i].app_list[j].select = 0;
                        } else {
                            fetch[i].app_list[j].select = 1;
                        }
                    }
                }
                data.apps = fetch;
                yield put({ type: 'setData', payload: data });
            } catch (error) {
                console.log(`查询失败：${error.message}`);
            }
        },
        /**
         * 保存案件
         */
        *saveCase({ payload }: AnyAction, { call, put }: EffectsCommandMap) {
            const db = new Db<CCaseInfo>(TableName.Case);
            yield put({ type: 'setSaving', payload: true });
            UserHistory.set(HistoryKeys.HISTORY_UNITNAME, payload.m_strCheckUnitName);//将用户输入的单位名称记录到本地存储中，下次输入可读取
            try {
                let data: CCaseInfo = yield call([db, 'findOne'], { _id: payload._id });
                payload.devices = data.devices;
                yield call([db, 'update'], { _id: payload._id }, payload);
                yield put(routerRedux.push('/case'));
                message.success('保存成功');
            } catch (error) {
                console.error(`编辑案件失败 @modal/case/CaseEdit.ts/saveCase: ${error.message}`);
                message.error('保存失败');
            } finally {
                yield put({ type: 'setSaving', payload: false });
            }
        }
    }
};

export { StoreState, ExtendCaseInfo };
export default model;