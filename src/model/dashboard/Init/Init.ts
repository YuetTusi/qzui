import { AnyAction } from 'redux';
import { EffectsCommandMap, Model, SubscriptionAPI } from 'dva';
import { rpc } from '@src/service/rpc';
import message from 'antd/lib/message';
import { ipcRenderer } from 'electron';
import { PhoneInfoStatus } from '@src/components/PhoneInfo/PhoneInfoStatus';
import { helper } from '@src/utils/helper';
import { stPhoneInfoPara } from '@src/schema/stPhoneInfoPara';
import { AppDataExtractType } from '@src/schema/AppDataExtractType';
import { CCheckOrganization } from '@src/schema/CCheckOrganization';
import { BrandName } from '@src/schema/BrandName';
import { FetchResposeUI } from '@src/schema/FetchResposeUI';
import logger from '@src/utils/log';
import localStore from '@src/utils/localStore';
import { tipsStore, caseStore } from '@src/utils/localStore';
import { DetailMessage } from '@src/type/DetailMessage';
import config from '@src/config/ui.config.json';

const MAX_USB: number = config.max;
const CHANNEL: string = 'default'; //反向调用channel_id，暂时不需要

/**
 * 仓库State
 */
interface IStoreState {
    /**
     * USB监听到的手机数据(目前至多8台)
     */
    phoneData: ExtendPhoneInfoPara[];
    /**
     * 采集提示分类码 (弹框类型，采集时后端反馈，为空时不显示)
     */
    tipsType: AppDataExtractType | null;
    /**
     * 当前反馈的手机序列号
     */
    piSerialNumber: string;
    /**
     * 当前反馈的手机物理USB端口
     */
    piLocationID: string;
    /**
     * 当前反馈的手机品牌
     */
    piBrand: BrandName;

    /**
     * 采集响应状态码（采集过程中对用户的提示，对应FetchResposeUI枚举）
     */
    fetchResponseCode: number;
    /**
     * 采集响应状态码对应的手机ID
     * #OPPO手机会根据此id删除LocalStorage数据
     */
    fetchResponseID: string | null;

    /**
     * 采集单位是否为空
     */
    isEmptyUnit: boolean;
    /**
     * 检验员信息是否为空
     */
    isEmptyOfficer: boolean;
    /**
     * 案件信息是否为空
     */
    isEmptyCase: boolean;
    /**
     * 案件存储路径是否为空
     */
    isEmptyCasePath: boolean;
    /**
     * 采集详情消息
     */
    detailMessage: DetailMessage | null;
}

interface ExtendPhoneInfoPara extends stPhoneInfoPara {
    /**
     * 组件状态（枚举 0:未连接 1:已连接 2:采集中 5:采集完成 6:小圆圈）
     */
    status: PhoneInfoStatus;
}

/**
 * 初始化连接设备
 * 对应组件：view/dashboard/Init
 */
let model: Model = {
    namespace: 'init',
    state: {
        phoneData: [],
        tipsType: null,
        fetchResponseCode: -1,
        fetchResponseID: null,
        isEmptyUnit: false,
        isEmptyOfficer: false,
        isEmptyCase: false,
        isEmptyCasePath: false,
        detailMessage: null
    },
    reducers: {
        setPhoneData(state: IStoreState, { payload }: AnyAction) {
            const tipsBackup = localStore.get('TIPS_BACKUP');
            if (tipsBackup && payload.length < state.phoneData.length) {
                //NOTE:USB拔出时，删除掉Storage中的数据（如果有）
                tipsStore.removeDiff(payload.map((item: stPhoneInfoPara) => ({ id: item.piSerialNumber! + item.piLocationID })));
                caseStore.removeDiff(payload.map((item: stPhoneInfoPara) => ({ id: item.piSerialNumber! + item.piLocationID })));
            }
            let list = new Array(MAX_USB);
            payload.forEach((data: stPhoneInfoPara) => {
                if (data.m_nOrder! - 1 < MAX_USB) {
                    //#将手机渲染数组与USB序号对应
                    list[data.m_nOrder! - 1] = { ...data, status: data.m_ConnectSate };
                }
            });
            return {
                ...state,
                phoneData: list
            }
        },
        clearPhoneData(state: IStoreState) {
            localStore.remove('TIPS_BACKUP');
            localStore.remove('CASE_DATA');
            return {
                ...state,
                phoneData: []
            }
        },
        /**
         * 设置采集状态
         * @param state 
         * @param payload 1部或多部(stPhoneInfoPara)数据
         */
        setStatus(state: IStoreState, { payload }: AnyAction) {
            if (helper.isArray(payload)) {
                return {
                    ...state,
                    phoneData: [...payload]
                };
            } else {
                let { phoneData } = state;
                let updated = phoneData.map((item: any) => {
                    if (item?.piSerialNumber === payload.piSerialNumber &&
                        item?.piLocationID === payload.piLocationID) {
                        return { ...payload };
                    } else {
                        return item;
                    }
                });
                return {
                    ...state,
                    phoneData: updated
                }
            }
        },
        /**
         * 设置用户弹框类型
         */
        setTipsType(state: IStoreState, { payload }: AnyAction) {
            return {
                ...state,
                tipsType: payload.tipsType,
                piBrand: payload.piBrand,
                piSerialNumber: payload.piSerialNumber,
                piLocationID: payload.piLocationID
            }
        },
        /**
         * 清空用户提示（关闭提示框）
         */
        clearTipsType(state: IStoreState) {
            return {
                ...state,
                tipsType: null,
                piSerialNumber: '',
                piLocationID: ''
            }
        },
        setEmptyUnit(state: IStoreState, { payload }: AnyAction) {
            return { ...state, isEmptyUnit: payload };
        },
        setEmptyOfficer(state: IStoreState, { payload }: AnyAction) {
            return { ...state, isEmptyOfficer: payload };
        },
        setEmptyCase(state: IStoreState, { payload }: AnyAction) {
            return { ...state, isEmptyCase: payload };
        },
        setEmptyCasePath(state: IStoreState, { payload }: AnyAction) {
            return { ...state, isEmptyCasePath: payload };
        },
        /**
         * 设置采集响应状态码
         */
        setFetchResponseCode(state: IStoreState, { payload }: AnyAction) {
            return {
                ...state,
                fetchResponseCode: payload.fetchResponseCode,
                fetchResponseID: payload.fetchResponseID
            };
        },
        setDetailMessage(state: IStoreState, { payload }: AnyAction) {
            return { ...state, detailMessage: payload };
        }
    },
    effects: {
        /**
         * 开始取证
         */
        *start({ payload }: AnyAction, { fork }: EffectsCommandMap) {
            const { caseData } = payload;
            yield fork([rpc, 'invoke'], 'Start', [caseData]);
        },
        /**
         * 停止取证
         */
        *stop({ payload }: AnyAction, { fork }: EffectsCommandMap) {
            yield fork([rpc, 'invoke'], 'CancelFetch', [payload]);
        },
        /**
         * 用户操作完成
         */
        *operateFinished({ payload }: AnyAction, { fork }: EffectsCommandMap) {
            yield fork([rpc, 'invoke'], 'OperateFinished', [payload]);
        },
        /**
         * 查询案件是否为空
         */
        *queryEmptyCase({ payload }: AnyAction, { call, put }: EffectsCommandMap) {
            try {
                let casePath = yield call([rpc, 'invoke'], 'GetDataSavePath');
                let result = yield call([rpc, 'invoke'], 'GetCaseList', [casePath]);
                yield put({ type: 'setEmptyCase', payload: result.length === 0 });
            } catch (error) {
                console.log(`@modal/dashboard/Init/Init.ts/queryEmptyUnit:${error.message}`);
                logger.error({ message: `@modal/dashboard/Init/Init.ts/queryEmptyUnit: ${error.stack}` });
            }
        },
        /**
         * 查询检验员是否为空
         */
        *queryEmptyOfficer({ payload }: AnyAction, { call, put }: EffectsCommandMap) {
            try {
                let result = yield call([rpc, 'invoke'], 'GetCheckerInfo', []);
                yield put({ type: 'setEmptyOfficer', payload: result.length === 0 });
            } catch (error) {
                console.log(`@modal/dashboard/Init/Init.ts/queryEmptyOfficer:${error.message}`);
                logger.error({ message: `@modal/dashboard/Init/Init.ts/queryEmptyOfficer: ${error.stack}` });
            }
        },
        /**
         * 查询检验单位是否为空
         */
        *queryEmptyUnit({ payload }: AnyAction, { call, put }: EffectsCommandMap) {
            try {
                let entity: CCheckOrganization = yield call([rpc, 'invoke'], 'GetCurCheckOrganizationInfo');
                let { m_strCheckOrganizationName } = entity;
                if (m_strCheckOrganizationName) {
                    yield put({ type: 'setEmptyUnit', payload: false });
                } else {
                    yield put({ type: 'setEmptyUnit', payload: true });
                }
            } catch (error) {
                console.log(`@modal/dashboard/Init/Init.ts/queryEmptyUnit:${error.message}`);
                logger.error({ message: `@modal/dashboard/Init/Init.ts/queryEmptyUnit: ${error.stack}` });
            }
        },
        /**
         * 查询案件存储路径是否未设置
         */
        *queryEmptyCasePath({ payload }: AnyAction, { call, put }: EffectsCommandMap) {
            try {
                let result = yield call([rpc, 'invoke'], 'GetDataSavePath');
                yield put({ type: 'setEmptyCasePath', payload: result.trim().length === 0 });
            } catch (error) {
                logger.error({ message: `@modal/dashboard/Init/Init.ts/queryEmptyCasePath: ${error.stack}` });
            }
        },
        /**
         * 开始接收一部手机的详情数据
         */
        *subscribeDetail({ payload }: AnyAction, { fork, put }: EffectsCommandMap) {
            try {
                yield fork([rpc, 'invoke'], 'SubscribePhone', [payload]);
                yield put({ type: 'setShowDetail', payload: true });
            } catch (error) {
                logger.error({ message: `@modal/dashboard/Init/Init.ts/subscribeDetail: ${error.stack}` });
            }
        },
        /**
         * 结束接收一部手机的详情数据
         */
        *unsubscribeDetail({ payload }: AnyAction, { fork, put }: EffectsCommandMap) {
            try {
                yield fork([rpc, 'invoke'], 'UnsubscribePhone', [payload]);
                yield put({ type: 'setShowDetail', payload: false });
                yield put({ type: 'setDetailMessage', payload: null });
            } catch (error) {
                logger.error({ message: `@modal/dashboard/Init/Init.ts/unsubscribeDetail: ${error.stack}` });
            }
        }
    },
    subscriptions: {
        /**
         * 发布反向调用方法
         */
        publishReverseMethods({ dispatch, history }: SubscriptionAPI) {
            rpc.provide([
                /**
                 * 连接设备的反馈，当插拔USB时后台会推送数据
                 * @param args stPhoneInfoPara数组
                 */
                function receiveUsb(args: stPhoneInfoPara[]): void {
                    if (args && args.length > 0) {
                        dispatch({ type: 'setPhoneData', payload: args });
                    } else {
                        //USB已断开
                        dispatch({ type: 'clearPhoneData' });
                    }
                },
                /**
                 * 采集反馈数据
                 * @param {stPhoneInfoPara} data 后端反馈的结构体
                 */
                function collectBack(phoneInfo: stPhoneInfoPara): void {
                    //通知详情框采集完成
                    ipcRenderer.send('collecting-detail', { ...phoneInfo, isFinished: true });
                    ipcRenderer.send('show-notice', { title: '取证完成', message: `「${phoneInfo.piBrand}」手机数据已取证完成` });
                    //将此手机状态置为"取证完成"
                    dispatch({
                        type: 'setStatus', payload: {
                            ...phoneInfo,
                            status: PhoneInfoStatus.FETCHEND
                        }
                    });
                },
                /**
                 * 用户提示反馈数据
                 * @param phoneInfo 手机采集数据
                 * @param type 提示类型枚举
                 */
                function tipsBack(phoneInfo: stPhoneInfoPara, type: AppDataExtractType): void {
                    tipsStore.set({
                        id: phoneInfo.piSerialNumber! + phoneInfo.piLocationID,
                        AppDataExtractType: type,
                        Brand: phoneInfo.piBrand!,
                        IsWifiConfirm: false
                    });
                    ipcRenderer.send('show-notice', {
                        title: '备份提示',
                        message: `请点击「消息」链接按步骤对${phoneInfo.piBrand}设备进行备份`
                    });
                    dispatch({
                        type: 'setTipsType', payload: {
                            tipsType: type,
                            piSerialNumber: phoneInfo.piSerialNumber,
                            piLocationID: phoneInfo.piLocationID,
                            piBrand: phoneInfo.piBrand
                        }
                    });
                },
                /**
                 * 用户确认反馈
                 * @param id 序列号+USB物理ID
                 * @param code 采集响应码
                 */
                function userConfirm(id: string, code: FetchResposeUI): void {
                    dispatch({
                        type: 'setFetchResponseCode', payload: {
                            fetchResponseCode: code,
                            fetchResponseID: id
                        }
                    });
                },
                /**
                 * 采集详情实时消息
                 * @param message 采集消息对象
                 */
                function collectDetail(message: DetailMessage) {
                    dispatch({ type: 'setDetailMessage', payload: message });
                }
            ], CHANNEL);
        },
        /**
         * 连接远程RPC服务器
         * 连接成功后查询手机列表
         */
        connectRpcServer({ dispatch }: SubscriptionAPI) {

            rpc.invoke('GetDevlist', []).then((phoneData: stPhoneInfoPara[]) => {
                tipsStore.removeDiff(phoneData.map((item: stPhoneInfoPara) => ({ id: item?.piSerialNumber! + item?.piLocationID })));
                caseStore.removeDiff(phoneData.map<any>((item: stPhoneInfoPara) => ({ id: item?.piSerialNumber! + item?.piLocationID })));
                dispatch({ type: 'setPhoneData', payload: phoneData });
            }).catch((err: Error) => console.log(err));
            dispatch({ type: 'caseInputModal/queryUnit' });
            dispatch({ type: 'caseInputModal/queryCaseList' });
            dispatch({ type: 'caseInputModal/queryOfficerList' });
        }
    }
}

export { IStoreState, ExtendPhoneInfoPara };
export default model;