import { AnyAction } from 'redux';
import { Model, EffectsCommandMap } from 'dva';
import { routerRedux } from 'dva/router';
import { CCaseInfo } from '@src/schema/CCaseInfo';
import { fetcher } from '@src/service/rpc';
import { apps } from '@src/config/view.config';
import message from 'antd/lib/message';

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
                    m_bIsAutoParse: payload
                }
            };
        },
        /**
         * 设置是否生成BCP（true或false）
         */
        setGenerateBCP(state: StoreState, { payload }: AnyAction) {
            return {
                ...state,
                data: { ...state.data, m_bIsGenerateBCP: payload }
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
                        if (data.m_Applist.find(item => item.m_strID === fetch[i].app_list[j].app_id) === undefined) {
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
        *saveCase(action: AnyAction, { call, put }: EffectsCommandMap) {
            yield put({ type: 'setSaving', payload: true });
            try {
                yield call([fetcher, 'invoke'], 'SaveCaseInfo', [action.payload]);
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