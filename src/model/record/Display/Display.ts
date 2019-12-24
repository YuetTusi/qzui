import { ipcRenderer } from 'electron';
import { AnyAction } from 'redux';
import { Model, SubscriptionAPI } from 'dva';
import { Location } from 'history';

/**
 * 数据采集首页Model
 * 对应视图: view/record/Display
 */
let model: Model = {
    namespace: 'display',
    state: null,
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
    },
    subscriptions: {
        startParsing({ history }: SubscriptionAPI) {
            history.listen(({ pathname }: Location) => {
                if (pathname === '/record') {
                    ipcRenderer.send('parsing-detail', true);
                } else {
                    ipcRenderer.send('parsing-detail', null);
                }
            });
        }
    }
};

export default model;