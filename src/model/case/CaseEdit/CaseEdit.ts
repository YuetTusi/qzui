import { mkdirSync } from 'fs';
import path from 'path';
import { AnyAction } from 'redux';
import { Model, EffectsCommandMap } from 'dva';
import { routerRedux } from 'dva/router';
import message from 'antd/lib/message';
import { CCaseInfo } from '@src/schema/CCaseInfo';
import { Officer as OfficerEntity } from '@src/schema/Officer';
import Db from '@utils/db';
import logger from '@utils/log';
import { helper } from '@utils/helper';
import UserHistory, { HistoryKeys } from '@utils/userHistory';
import apps from '@src/config/app.yaml';
import { TableName } from '@src/schema/db/TableName';

interface StoreState {
    /**
     * 当前编辑的案件对象
     */
    data: ExtendCaseInfo;
    /**
     * 采集人员列表
     */
    officerList: OfficerEntity[];
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
        officerList: [],
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
         * 是否拉取SD卡
         */
        setSdCard(state: StoreState, { payload }: AnyAction) {
            state.data.sdCard = payload;
            return state;
        },
        /**
         * 是否生成报告
         */
        setHasReport(state: StoreState, { payload }: AnyAction) {
            state.data.hasReport = payload;
            return state;
        },
        /**
         * 设置是否自动解析值（true或false）
         */
        setAutoParse(state: StoreState, { payload }: AnyAction) {
            state.data.m_bIsAutoParse = payload;
            return state;
        },
        /**
         * 设置是否生成BCP
         * @param {boolean} payload 
         */
        setGenerateBcp(state: StoreState, { payload }: AnyAction) {
            state.data.generateBcp = payload;
            return state;
        },
        /**
         * 设置是否包含附件
         */
        setAttachment(state: StoreState, { payload }: AnyAction) {
            state.data.attachment = payload;
            return state;
        },
        /**
         * 更新采集人员Options
         * @param {OfficerEntity[]} payload; 
         */
        setOfficerList(state: StoreState, { payload }: AnyAction) {
            state.officerList = payload;
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
         * 查询采集人员Options
         */
        *queryOfficerList({ payload }: AnyAction, { call, put }: EffectsCommandMap) {
            const db = new Db<OfficerEntity>(TableName.Officer);
            try {
                let data: OfficerEntity[] = yield call([db, 'find'], {});
                yield put({ type: 'setOfficerList', payload: data });
            } catch (error) {
                logger.error(`查询采集人员列表失败 @model/case/CaseEdit/queryOfficerList:${error.message}`);
            }
        },
        /**
         * 保存案件
         */
        *saveCase({ payload }: AnyAction, { call, fork, put }: EffectsCommandMap) {
            const db = new Db<CCaseInfo>(TableName.Case);
            const casePath = path.join(payload.m_strCasePath, payload.m_strCaseName);
            yield put({ type: 'setSaving', payload: true });
            UserHistory.set(HistoryKeys.HISTORY_UNITNAME, payload.m_strCheckUnitName);//将用户输入的单位名称记录到本地存储中，下次输入可读取
            try {
                yield call([db, 'update'], { _id: payload._id }, payload);
                let exist = yield helper.existFile(casePath);
                if (!exist) {
                    //案件路径不存在，创建之
                    mkdirSync(casePath);
                }
                yield fork([helper, 'writeJSONfile'], path.join(casePath, 'Case.json'), {
                    caseName: payload.m_strCaseName ?? '',
                    checkUnitName: payload.m_strCheckUnitName ?? '',
                    officerName: payload.officerName ?? '',
                    officerNo: payload.officerNo ?? '',
                    securityCaseNo: payload.securityCaseNo ?? '',
                    securityCaseType: payload.securityCaseType ?? '',
                    securityCaseName: payload.securityCaseName ?? '',
                    handleCaseNo: payload.handleCaseNo ?? '',
                    handleCaseName: payload.handleCaseName ?? '',
                    handleCaseType: payload.handleCaseType ?? '',
                    handleOfficerNo: payload.handleOfficerNo ?? ''
                });
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