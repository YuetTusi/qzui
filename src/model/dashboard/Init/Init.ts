import { AnyAction } from 'redux';
import { EffectsCommandMap, Model, SubscriptionAPI } from 'dva';
import { fetcher } from '@src/service/rpc';
import { PhoneInfoStatus } from '@src/components/PhoneInfo/PhoneInfoStatus';
import { helper } from '@src/utils/helper';
import { stPhoneInfoPara } from '@src/schema/stPhoneInfoPara';
import { AppDataExtractType } from '@src/schema/AppDataExtractType';
import { CCheckOrganization } from '@src/schema/CCheckOrganization';
import { BrandName } from '@src/schema/BrandName';
import logger from '@src/utils/log';
import localStore from '@src/utils/localStore';
import { caseStore } from '@src/utils/localStore';
import { DetailMessage } from '@src/type/DetailMessage';
import config from '@src/config/ui.config.json';

const MAX_USB: number = config.max;

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
     * 用户采集响应码
     */
    m_ResponseUI: number;
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
    /**
     * 正在停止中
     */
    isStopping: boolean;
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
        m_ResponseUI: -1,
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
                // tipsStore.removeDiff(payload.map((item: stPhoneInfoPara) => ({ id: item.piSerialNumber! + item.piLocationID })));
                caseStore.removeDiff(payload.map((item: stPhoneInfoPara) => ({ id: item.piSerialNumber! + item.piLocationID })));
            }
            let list = new Array(MAX_USB);
            payload.forEach((data: stPhoneInfoPara) => {
                if (data.m_nOrder! - 1 < MAX_USB) {
                    //#将手机渲染数组与USB序号对应
                    list[data.m_nOrder! - 1] = {
                        ...data,
                        status: data.m_ConnectSate,
                        isStopping: false
                    };
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
                phoneData: [],
                tipsType: null,
                fetchResponseCode: -1,
                fetchResponseID: null
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
                piLocationID: payload.piLocationID,
                m_ResponseUI: payload.m_ResponseUI
            }
        },
        /**
         * 清空用户提示（关闭提示框）
         */
        clearTipsType(state: IStoreState) {
            return {
                ...state,
                tipsType: null,
                m_ResponseUI: -1,
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
        },
        setResponseUI(state: IStoreState, { payload }: AnyAction) {
            let { phoneData } = state;
            let updated = phoneData.map((item: any) => {
                if (item?.piSerialNumber === payload.piSerialNumber &&
                    item?.piLocationID === payload.piLocationID) {
                    return { ...item, m_ResponseUI: payload.m_ResponseUI };
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
    effects: {
        /**
         * 开始取证
         */
        *start({ payload }: AnyAction, { fork }: EffectsCommandMap) {
            console.log(payload.caseData);
            const { caseData } = payload;
            yield fork([fetcher, 'invoke'], 'Start', [caseData]);
        },
        /**
         * 停止取证
         */
        *stop({ payload }: AnyAction, { fork }: EffectsCommandMap) {
            yield fork([fetcher, 'invoke'], 'CancelFetch', [payload]);
        },
        /**
         * 用户操作完成
         */
        *operateFinished({ payload }: AnyAction, { fork }: EffectsCommandMap) {
            yield fork([fetcher, 'invoke'], 'OperateFinished', [payload]);
        },
        /**
         * 查询案件是否为空
         */
        *queryEmptyCase({ payload }: AnyAction, { call, put }: EffectsCommandMap) {
            try {
                let casePath = yield call([fetcher, 'invoke'], 'GetDataSavePath');
                let result = yield call([fetcher, 'invoke'], 'GetCaseList', [casePath]);
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
                let result = yield call([fetcher, 'invoke'], 'GetCheckerInfo', []);
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
                let entity: CCheckOrganization = yield call([fetcher, 'invoke'], 'GetCurCheckOrganizationInfo');
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
                let result = yield call([fetcher, 'invoke'], 'GetDataSavePath');
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
                yield fork([fetcher, 'invoke'], 'SubscribePhone', [payload]);
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
                yield fork([fetcher, 'invoke'], 'UnsubscribePhone', [payload]);
                yield put({ type: 'setShowDetail', payload: false });
                yield put({ type: 'setDetailMessage', payload: null });
            } catch (error) {
                logger.error({ message: `@modal/dashboard/Init/Init.ts/unsubscribeDetail: ${error.stack}` });
            }
        },
        /**
         * 查询手机列表
         */
        *queryPhoneList({ payload }: AnyAction, { call, put }: EffectsCommandMap) {
            try {
                let phoneData: stPhoneInfoPara[] = yield call([fetcher, 'invoke'], 'GetDevlist', []);
               
                caseStore.removeDiff(phoneData.map<any>((item: stPhoneInfoPara) => ({ id: item?.piSerialNumber! + item?.piLocationID })));
                yield put({ type: 'setPhoneData', payload: phoneData });

            } catch (error) {
                logger.error({ message: `@modal/dashboard/Init/Init.ts/queryPhoneList: ${error.stack}` });
            }
        }
    },
    subscriptions: {
        /**
         * 连接远程RPC服务器
         * 连接成功后查询手机列表
         */
        connectRpcServer({ dispatch }: SubscriptionAPI) {
            dispatch({ type: 'queryPhoneList' });
            dispatch({ type: 'caseInputModal/queryUnit' });
            dispatch({ type: 'caseInputModal/queryCaseList' });
            dispatch({ type: 'caseInputModal/queryOfficerList' });
        }
    }
}

export { IStoreState, ExtendPhoneInfoPara };
export default model;