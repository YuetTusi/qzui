import { AnyAction } from 'redux';
import { ipcRenderer, IpcRendererEvent } from 'electron';
import { Model, SubscriptionAPI, EffectsCommandMap } from 'dva';
import server from '@src/service/tcpServer';
import { fetcher, parser, platformer } from '@src/service/rpc';
import { fetchReverseMethods, parseReverseMethods, platformReverseMethods } from '@src/service/reverse';
import { IStoreState, ExtendPhoneInfoPara } from './Init/Init';
import Modal from 'antd/lib/modal';
import { ConnectState } from '@src/schema/ConnectState';
import FetchCommond from '@src/schema/GuangZhou/FetchCommond';
import { helper } from '@src/utils/helper';
import CCaseInfo from '@src/schema/CCaseInfo';
import apps from '@src/config/app.yaml';
import { CParseApp } from '@src/schema/CParseApp';
import { ICategory, IIcon } from '@src/components/AppList/IApps';
import CClientInfo from '@src/schema/CClientInfo';
import logger from '@src/utils/log';
import platform from '@src/utils/platform';
import { DeviceType } from '@src/schema/socket/DeviceType';

const config = helper.readConf();

const getAllPackages = (): CParseApp[] => {
    const { fetch } = apps;
    let selectedApp: CParseApp[] = [];
    fetch.forEach((catetory: ICategory, index: number) => {
        catetory.app_list.forEach((current: IIcon) => {
            selectedApp.push(new CParseApp({ m_strID: current.app_id, m_strPktlist: current.packages }));
        });
    });
    return selectedApp;
}

interface StoreData {
    /**
     * 第三方警综平台数据
     */
    platformData?: FetchCommond | null;
    /**
     * 从第三方平台数据创建或读取的案件
     */
    caseFromPlatform?: CCaseInfo | null;
}

/**
 * 首个加载的Model
 * #在此统一处理RPC的反向方法发布
 * #以及断线重连后查询接口的调用
 */
let model: Model = {
    namespace: 'dashboard',
    state: {
        caseFromPlatform: null
    },
    reducers: {
        setPlatformData(state: any, { payload }: AnyAction) {
            return { ...state, platformData: payload };
        },
        setCaseFromPlatform(state: any, { payload }: AnyAction) {
            return { ...state, caseFromPlatform: payload };
        }
    },
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
        },
        /**
         * 接收第三方平台数据创建案件
         */
        *addCaseFromPlatform({ payload }: AnyAction, { call, put }: EffectsCommandMap) {
            try {
                let casePath = yield call([fetcher, 'invoke'], 'GetDataSavePath');
                let result: CCaseInfo[] = yield call([fetcher, 'invoke'], 'GetCaseList', [casePath]);

                let currentCase = result.find(item => {
                    let pos = item.m_strCaseName.lastIndexOf('\\');
                    let caseName = item.m_strCaseName.substring(pos + 1).split('_')[0];
                    return caseName === payload.CaseName;
                });
                if (currentCase) {
                    //NOTE:如果第三方平台的案件名称已有，则把案件读取出来
                    logger.info('案件已存在，读取已有案件：', currentCase.m_strCaseName);
                    yield put({ type: 'setCaseFromPlatform', payload: currentCase });
                } else {
                    //NOTE:若不存在，用第三方平台的案件名称创建一个新案件
                    logger.info('案件不存在，使用第三方数据创建案件：', payload.CaseName);
                    let entity = new CCaseInfo();
                    entity.m_strCaseName = `${(payload as FetchCommond).CaseName!.replace(/_/g, '')}_${helper.timestamp()}`;
                    entity.m_strCheckUnitName = (payload as FetchCommond).OfficerName!;
                    entity.m_strDstCheckUnitName = (payload as FetchCommond).deptName!;
                    entity.m_bIsAutoParse = true;
                    entity.m_bIsGenerateBCP = true;
                    entity.m_bIsAttachment = false;
                    entity.m_Applist = getAllPackages();
                    entity.m_strCaseNo = (payload as FetchCommond).CaseID!;
                    entity.m_strCaseType = (payload as FetchCommond).CaseType!;
                    entity.m_strBCPCaseName = (payload as FetchCommond).CaseName!;
                    entity.m_strGaCaseName = (payload as FetchCommond).CaseName!;
                    // entity.m_strGaCaseType= values.m_strGaCaseType;
                    entity.m_strGaCaseNo = (payload as FetchCommond).CaseID!;
                    entity.m_strGaCasePersonNum = (payload as FetchCommond).OfficerID!;

                    yield call([fetcher, 'invoke'], 'SaveCaseInfo', [entity]);
                    yield put({ type: 'setCaseFromPlatform', payload: entity });
                }
            } catch (error) {
                logger.error(`从第三方数据读取/创建案件失败: ${error.message}`);
                yield put({ type: 'setPlatformData', payload: null });
                yield put({ type: 'setCaseFromPlatform', payload: null });
            }
        }
    },
    subscriptions: {
        /**
         * 接收设备连接信息
         */
        receiveDevice({ dispatch }: SubscriptionAPI) {

            server.on('device', (data: DeviceType) => {

                console.log(data);

                // let mock: DeviceType = {
                //     brand: 'Samsung',
                //     model: 'S60',
                //     system: 'android',
                //     usb: '2',
                //     fetchState: FetchState.Connected
                // }

                switch (data.cmd) {
                    case 'device_in':
                        dispatch({ type: 'device/setDeviceToList', payload: data });
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

export { StoreData };
export default model;