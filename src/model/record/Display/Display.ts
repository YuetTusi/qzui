import { ipcRenderer } from 'electron';
import { AnyAction } from 'redux';
import { Model, SubscriptionAPI, EffectsCommandMap } from 'dva';
import { Location } from 'history';
import Rpc from '@src/service/rpc';
import { UIRetOneInfo } from '@src/schema/UIRetOneInfo';
import groupBy from 'lodash/groupBy';
import logger from '@src/utils/log';
import config from '@src/config/ui.config.json';

/**
 * 仓库State数据
 */
interface StoreState {
    /**
     * 列表数据
     */
    data: any[],
    /**
     * 显示读取中状态
     */
    loading: boolean;
}

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
            try {
                let data: UIRetOneInfo[] = yield call([rpc, 'invoke'], 'GetAllInfo', []);
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
        loopFetchList({ history }: SubscriptionAPI) {
            history.listen(({ pathname }: Location) => {
                if (pathname === '/record') {
                    setTimeout(() => ipcRenderer.send('parsing-table', true), 1064);
                } else {
                    ipcRenderer.send('parsing-table', null);
                }
            });
        }
    }
};

export { StoreState };
export default model;