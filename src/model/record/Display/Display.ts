import { AnyAction } from 'redux';
import { Model, SubscriptionAPI, EffectsCommandMap } from 'dva';
import { Location } from 'history';
import { parser } from '@src/service/rpc';
import { UIRetOneInfo } from '@src/schema/UIRetOneInfo';
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
                yield fork([parser, 'invoke'], 'StartManualTask', [strCase_, strPhone_]);
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
                    parser.invoke('UITaskManage', [true]);
                } else {
                    parser.invoke('UITaskManage', [false]);
                }
            });
        }
    }
};

export { StoreState };
export default model;