import { AnyAction } from 'redux';
import { Model, EffectsCommandMap } from 'dva';
import { routerRedux } from 'dva/router';
import { CCaseInfo } from '@src/schema/CCaseInfo';
import { fetcher } from '@src/service/rpc';
import apps from '@src/config/app.yaml';
import message from 'antd/lib/message';
import localStore from '@src/utils/localStore';
import { helper } from '@src/utils/helper';

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
         * 设置是否自动解析值（true或false）
         */
        setAutoAnalysis(state: StoreState, { payload }: AnyAction) {
            return {
                ...state,
                data: {
                    ...state.data,
                    m_bIsAutoParse: payload,
                    m_bIsAttachment: false
                }
            };
        },
        /**
         * 设置是否生成BCP（true或false）
         */
        setGenerateBCP(state: StoreState, { payload }: AnyAction) {
            return {
                ...state,
                data: {
                    ...state.data,
                    m_bIsGenerateBCP: payload,
                    m_bIsAttachment: false
                }
            };
        },
        /**
         * 将BCP输入的相关字段置空
         */
        setBcpInputEmpty(state: StoreState, { payload }: AnyAction) {
            return {
                ...state,
                data: {
                    ...state.data,
                    m_strCaseNo: '',
                    m_strCaseType: '100',
                    m_strBCPCaseName: '',
                    m_strGaCaseNo: '',
                    m_strGaCaseType: '',
                    m_strGaCaseName: '',
                    m_strGaCasePersonNum: ''
                }
            };
        },
        /**
         * 设置是否带有附件
         */
        setAttachment(state: StoreState, { payload }: AnyAction) {
            return {
                ...state,
                data: { ...state.data, m_bIsAttachment: payload }
            };
        },
        setData(state: StoreState, { payload }: AnyAction) {
            return {
                ...state,
                data: { ...payload }
            }
        },
        setSaving(state: StoreState, { payload }: AnyAction) {
            return {
                ...state,
                saving: payload
            }
        }
    },
    effects: {
        /**
         * 传路径查询案件对象
         */
        *queryCaseByPath({ payload }: AnyAction, { call, put }: EffectsCommandMap) {
            try {
                let data: ExtendCaseInfo = yield call([fetcher, 'invoke'], 'GetSpecCaseInfo', [payload]);
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
            yield put({ type: 'setSaving', payload: true });
            let unitName: string[] = localStore.get('HISTORY_UNITNAME');
            let unitNameSet = null;
            if (helper.isNullOrUndefined(unitName)) {
                unitNameSet = new Set([payload.m_strCheckUnitName]);
            } else {
                unitNameSet = new Set([payload.m_strCheckUnitName, ...unitName]);
            }
            localStore.set('HISTORY_UNITNAME', Array.from(unitNameSet)); //将用户输入的单位名称记录到本地存储中，下次输入可读取
            try {
                yield call([fetcher, 'invoke'], 'SaveCaseInfo', [payload]);
                yield put(routerRedux.push('/case'));
                message.success('保存成功');
            } catch (error) {
                console.error(`@modal/CaseEdit.ts/saveCase: ${error.message}`);
                message.error('保存失败');
            } finally {
                yield put({ type: 'setSaving', payload: false });
            }
        }
    }
};

export { StoreState, ExtendCaseInfo };
export default model;