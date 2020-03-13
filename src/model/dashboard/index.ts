import { ipcRenderer, IpcRendererEvent } from 'electron';
import { Model, SubscriptionAPI } from 'dva';
import { fetcher, parser } from '@src/service/rpc';
import { fetchReverseMethods, parseReverseMethods } from '@src/service/reverse';
import config from '@src/config/ui.config.json';

/**
 * 首个加载的Model
 * #在此统一处理RPC的反向方法发布
 * #以及断线重连后查询接口的调用
 */
let model: Model = {
    namespace: 'dashboard',
    state: {},
    subscriptions: {
        /**
         * 成功连接了Socket
         */
        connectSocket({ dispatch, history }: SubscriptionAPI) {
            ipcRenderer.on('socket-connect', (event: IpcRendererEvent, uri: string) => {
                switch (uri) {
                    case config.rpcUri:
                        fetcher.provide(fetchReverseMethods(dispatch), 'fetch');
                        dispatch({ type: 'caseData/fetchCaseData' });//案件列表
                        dispatch({ type: 'init/queryPhoneList' }); //绑定手机列表
                        dispatch({ type: 'caseInputModal/queryUnit' });
                        dispatch({ type: 'caseInputModal/queryCaseList' });
                        dispatch({ type: 'caseInputModal/queryOfficerList' });
                        dispatch({ type: 'importDataModal/queryCaseList' });
                        dispatch({ type: 'importDataModal/queryOfficerList' });
                        dispatch({ type: 'importDataModal/queryUnit' });
                        dispatch({ type: 'importDataModal/queryUnitData' });
                        dispatch({ type: 'importDataModal/queryCollectTypeData' });
                        dispatch({ type: 'unit/queryCurrentUnit' }); //当前检验单位
                        dispatch({ type: 'unit/queryUnitData', payload: { keyword: '', pageIndex: 1 } }); //检验单位表格
                        break;
                    case config.parsingUri:
                        parser.provide(parseReverseMethods(dispatch), 'parse');
                        if (history.location.pathname === '/record') {
                            dispatch({ type: 'display/subscribeTask' });
                        }
                        break;
                    default:
                        console.log(`错误的RPC Uri:${uri}`);
                        break;
                }
            });
        }
    }
}

export default model;