import { ipcRenderer } from 'electron';
import IModel, { IAction, IObject, ISubParam } from '@type/model';

/**
 * 数据采集首页Model
 * 对应视图: view/record/Display
 */
let model: IModel = {
    namespace: 'display',
    state: null,
    reducers: {
        setCaseData(state: IObject, action: IAction) {
            return {
                ...state,
                caseData: [...action.payload]
            }
        },
        setLoading(state: IObject, action: IAction) {
            return {
                ...state,
                loading: action.payload
            }
        }
    },
    effects: {
    },
    subscriptions: {
        startParsing({ history, dispatch }: ISubParam) {
            history.listen(({ pathname }: any) => {
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