import { AnyAction } from 'redux';
import { ipcRenderer, IpcRendererEvent } from 'electron';
import { Model, SubscriptionAPI, EffectsCommandMap } from 'dva';
import { fetcher, parser } from '@src/service/rpc';
import { fetchReverseMethods, parseReverseMethods } from '@src/service/reverse';
import { IStoreState, ExtendPhoneInfoPara } from './Init/Init';
import Modal from 'antd/lib/modal';
import { ConnectState } from '@src/schema/ConnectState';
import { helper } from '@src/utils/helper';

const config = helper.readConf();

/**
 * 首个加载的Model
 * #在此统一处理RPC的反向方法发布
 * #以及断线重连后查询接口的调用
 */
let model: Model = {
    namespace: 'dashboard',
    state: {},
    effects: {
        *fetchingAndParsingState({ payload }: AnyAction, { select }: EffectsCommandMap) {
            const initState: IStoreState = yield select((state: any) => state.init);
            const fetchingCount = initState.phoneData.reduce((total: number, current: ExtendPhoneInfoPara) => {
                if (current?.status === ConnectState.FETCHING) {
                    total++;
                }
                return total;
            }, 0);

            let question = `确认退出${config.title}？`;
            if (fetchingCount > 0) {
                question = '有设备正在取证，仍要退出？';
            }
            Modal.destroyAll();
            Modal.confirm({
                title: '退出',
                content: question,
                okText: '是',
                cancelText: '否',
                onOk() {
                    ipcRenderer.send('do-close', true);
                }
            });
        }
    },
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
        },
        exitApp({ dispatch }: SubscriptionAPI) {
            ipcRenderer.on('will-close', (event: IpcRendererEvent) => {
                dispatch({ type: 'fetchingAndParsingState' });
            });
        }
    }
}

export default model;