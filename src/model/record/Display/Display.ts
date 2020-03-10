import { AnyAction, Dispatch } from 'redux';
import { Model, SubscriptionAPI, EffectsCommandMap } from 'dva';
import { Location } from 'history';
import { Parsing } from '@src/service/rpc';
import { UIRetOneInfo } from '@src/schema/UIRetOneInfo';
import groupBy from 'lodash/groupBy';
import logger from '@src/utils/log';

/**
 * 仓库State数据
 */
interface StoreState {
    /**
     * 列表数据
     */
    data: any[];
    /**
     * 源数据
     */
    source: UIRetOneInfo[];
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
        source: [],
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
        },
        setSource(state: any, { payload }: AnyAction) {
            return {
                ...state,
                source: payload
            }
        }
    },
    effects: {
        /**
         * 解析手机数据
         */
        *startParsing({ payload }: AnyAction, { fork }: EffectsCommandMap) {
            const { strCase_, strPhone_ } = payload as UIRetOneInfo;
            try {
                yield fork([Parsing, 'invoke'], 'StartManualTask', [strCase_, strPhone_]);
            } catch (error) {
                logger.error({ message: `解析失败 @model/record/Display/startParsing: ${error.stack}` });
                console.log(`解析失败 @model/record/Display/startParsing:${error.message}`);
            }
        }
    },
    subscriptions: {
        startReceive({ dispatch, history }: SubscriptionAPI) {
            history.listen(({ pathname }: Location) => {
                if (pathname === '/record') {
                    //进入解析页，开始接收推送
                    Parsing.invoke('UITaskManage', [true]);
                } else {
                    Parsing.invoke('UITaskManage', [false]);
                }
            });
        },
        /**
         * 发布反向推送方法
         */
        publishMethods({ dispatch }: SubscriptionAPI) {
            Parsing.provide(reverseMethods(dispatch));
        },
        /**
         * 断开重连
         * 当rpc对象是新的，则重新发布反向方法
         */
        resetConnectRpc({ dispatch, history }: SubscriptionAPI) {
            history.listen(({ pathname }: Location) => {
                if (pathname === '/record') {
                    if (Parsing.needProvide) {
                        Parsing.provide(reverseMethods(dispatch));
                    }
                }
            })
        }
    }
};

/**
 * 反向调用方法
 * @param dispatch 派发方法
 */
function reverseMethods(dispatch: Dispatch<any>) {
    return [
        function parsingData(data: UIRetOneInfo[]) {
            try {
                dispatch({ type: 'setSource', payload: data });
                //按案件名分组
                const grp = groupBy<UIRetOneInfo>(data, (item) => item.strCase_);
                let caseList = [];
                for (let [k, v] of Object.entries<UIRetOneInfo[]>(grp as any)) {
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

                dispatch({ type: 'setParsingListData', payload: caseList });
            } catch (error) {
                logger.error({ message: `解析列表查询失败 @model/record/Display/parsingData: ${error.stack}` });
                console.log(`解析列表查询失败 @model/record/Display/parsingData:${error.message}`);
            }
        }
    ];
}


export { StoreState };
export default model;