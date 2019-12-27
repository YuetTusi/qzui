import { AnyAction } from 'redux';
import { Model, SubscriptionAPI, EffectsCommandMap } from 'dva';
import { Location } from 'history';
import Rpc from '@src/service/rpc';
import { UIRetOneInfo } from '@src/schema/UIRetOneInfo';
import groupBy from 'lodash/groupBy';
import { polling } from '@src/utils/polling';
import logger from '@src/utils/log';
import config from '@src/config/ui.config.json';

const DURATION = 3024;
/**
 * 仓库State数据
 */
interface StoreState { }

/**
 * 数据采集首页Model
 * 对应视图: view/record/Display
 */
let model: Model = {
    namespace: 'display',
    state: {
        data: [],
        loading: false
    },
    reducers: {
        setParsingListData(state: any, action: AnyAction) {
            return {
                ...state,
                data: [...action.payload]
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
         * 查询解析列表数据
         */
        *fetchParsingList(action: AnyAction, { call, put }: EffectsCommandMap) {
            //const rpc = new Rpc('tcp4://192.168.1.35:60000/');
            const rpc = new Rpc(config.parsingUri);
            yield put({ type: 'setLoading', payload: true });
            try {
                let data: UIRetOneInfo[] = yield call([rpc, 'invoke'], 'GetAllInfo', []);
                console.log(data);
                // let data: UIRetOneInfo[];
                // data = [
                //     { strCase_: '诈骗案', strPhone_: '13911520108', status_: 1 },
                //     { strCase_: '诈骗案', strPhone_: '15601186776', status_: 1 },
                //     { strCase_: '杀人案', strPhone_: '13911525503', status_: 2 },
                //     { strCase_: '诈骗案', strPhone_: '18677633201', status_: 1 },
                //     { strCase_: '诈骗案', strPhone_: '17908829345', status_: 1 },
                //     { strCase_: '测试案', status_: 0 },
                //     { strCase_: '刘强东嫖资不付案', status_: 0, strPhone_: '13801157792' }
                // ];
                //按案件名分组
                const grp = groupBy<UIRetOneInfo>(data, (item) => item.strCase_);
                let caseList = [];
                for (let [k, v] of Object.entries<UIRetOneInfo[]>(grp)) {
                    if (v[0].strPhone_) {
                        caseList.push({
                            caseName: k,
                            phone: v
                        });
                    } else {
                        caseList.push({
                            caseName: k,
                            phone: []
                        });
                    }
                }
                yield put({ type: 'setParsingListData', payload: caseList });
            } catch (error) {
                logger.error({ message: `解析列表查询失败 @model/record/Display/fetchParsingList: ${error.stack}` });
                console.log(`解析列表查询失败 @model/record/Display/fetchParsingList:${error.message}`);
            } finally {
                yield put({ type: 'setLoading', payload: false });
            }
        },
        /**
         * 解析手机数据
         */
        *startParsing({ payload }: AnyAction, { call, put }: EffectsCommandMap) {
            const { strCase_, strPhone_ } = payload as UIRetOneInfo;
            const rpc = new Rpc(config.parsingUri);
            try {
                let success: boolean = yield call([rpc, 'invoke'], 'StartManualTask', [strCase_, strPhone_]);
                if (success) {
                    yield put({ type: 'fetchParsingList' });
                }
            } catch (error) {
                logger.error({ message: `解析失败 @model/record/Display/startParsing: ${error.stack}` });
                console.log(`解析失败 @model/record/Display/startParsing:${error.message}`);
            }
        }
    },
    subscriptions: {
        /**
         * 轮询查询表格数据
         */
        loopFetchList({ history, dispatch }: SubscriptionAPI) {
            history.listen(({ pathname }: Location) => {
                polling(() => {
                    if (pathname === '/record') {
                        dispatch({ type: 'fetchParsingList' });
                        return true;
                    } else {
                        return false;
                    }
                }, DURATION);
            });
        }
    }
};

export { StoreState };
export default model;