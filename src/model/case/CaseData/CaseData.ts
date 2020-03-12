import { Fetch } from "@src/service/rpc";
import { Dispatch } from 'redux';
import { Location } from 'history';
import message from "antd/lib/message";
import { Model, EffectsCommandMap, SubscriptionAPI } from "dva";
import { AnyAction } from 'redux';
import CCaseInfo from "@src/schema/CCaseInfo";
import { helper } from '@src/utils/helper';
import { ipcRenderer } from "electron";

/**
 * 仓库Model
 */
interface StoreModel {
    caseData: any[];
    loading: boolean;
}

/**
 * 案件信息Model
 */
let model: Model = {
    namespace: 'caseData',
    state: {
        //案件表格数据
        caseData: [],
        loading: false
    },
    reducers: {
        setCaseData(state: any, action: AnyAction) {
            return {
                ...state,
                caseData: [...action.payload]
            }
        },
        setLoading(state: any, action: AnyAction) {
            return {
                ...state,
                loading: action.payload
            }
        }
    },
    effects: {
        /**
         * 查询案件列表
         */
        *fetchCaseData(action: AnyAction, { call, put }: EffectsCommandMap) {
            yield put({ type: 'setLoading', payload: true });
            try {
                let casePath = yield call([Fetch, 'invoke'], 'GetDataSavePath');
                let result: CCaseInfo[] = yield call([Fetch, 'invoke'], 'GetCaseList', [casePath]);
                //将时间戳拆分出来，转为创建时间列来显示
                let temp = result.map((item: CCaseInfo) => {
                    return {
                        ...item,
                        caseName: item.m_strCaseName.split('_')[0],
                        createTime: helper.parseDate(item.m_strCaseName.split('_')[1], 'YYYYMMDDHHmmss').format('YYYY年M月D日 HH:mm:ss')
                    }
                });
                yield put({ type: 'setCaseData', payload: temp });
            } catch (error) {
                console.log(`@modal/CaseData.ts/fetchCaseData: ${error.message}`);
            } finally {
                yield put({ type: 'setLoading', payload: false });
            }
        },
        /**
         * 删除案件,连同手机数据一并删除(参数传案件完整路径)
         */
        *deleteCaseData(action: AnyAction, { fork }: EffectsCommandMap) {
            try {
                message.info('正在删除...');
                yield fork([Fetch, 'invoke'], 'DeleteCaseInfo', [action.payload]);
            } catch (error) {
                console.log(`@modal/CaseData.ts/deleteCaseData: ${error.message}`);
            }
        },
        /**
         * 删除手机数据（传手机完整路径）
         */
        *deletePhoneData(action: AnyAction, { fork, put }: EffectsCommandMap) {
            const { phonePath } = action.payload;
            try {
                message.info('正在删除...');
                yield fork([Fetch, 'invoke'], 'DeletePhoneInfo', [phonePath]);
            } catch (error) {
                console.log(`@modal/CaseData.ts/deletePhoneData: ${error.message}`);
            }
        }
    },
    subscriptions: {
        /**
         * 发布反向调用方法
         */
        publishReverseMethods({ dispatch }: SubscriptionAPI) {
            Fetch.provide(reverseMethods(dispatch));
        },
        /**
         * 断开重连
         */
        resetConnectRpc({ dispatch, history }: SubscriptionAPI) {
            history.listen(({ pathname }: Location) => {
                if (pathname === '/case') {
                    Fetch.provide(reverseMethods(dispatch));
                }
            })
        }
    }
};

/**
 * 反向调用方法
 * @param dispatch 派发方法
 */
function reverseMethods(dispatch: Dispatch<any>): Array<Function> {
    return [
        /**
         * 案件删除后的推送
         * @param casePath 案件路径
         * @param success 是否成功
         */
        function DeleteCaseFinish(casePath: string, success: boolean) {
            ipcRenderer.send('show-notification', {
                type: success ? 'success' : 'info',
                message: '删除反馈',
                description: success ? '删除成功' : '删除失败'
            });
            dispatch({ type: 'caseData/fetchCaseData' });
            dispatch({ type: 'innerPhoneTable/fetchPhoneDataByCase', payload: casePath });
        }
    ];
}

export { StoreModel };
export default model;