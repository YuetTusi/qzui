import { IModel, ISubParam, IObject, IAction, IEffects } from '@type/model';
import Rpc from '@src/service/rpc';
import { message } from 'antd';
import { ipcRenderer } from 'electron';
import { PhoneInfoStatus } from '@src/components/PhoneInfo/PhoneInfoStatus';
import { helper } from '@src/utils/helper';
import Reply from '@src/service/reply';
import { stPhoneInfoPara } from '@src/schema/stPhoneInfoPara';
import { AppDataExtractType } from '@src/schema/AppDataExtractType';
import { CCheckOrganization } from '@src/schema/CCheckOrganization';
import { FetchResposeUI } from '@src/schema/FetchResposeUI';
import logger from '@src/utils/log';
import sessionStore from '@src/utils/sessionStore';
import { tipsStore } from '@src/utils/sessionStore';
import config from '@src/config/ui.config.json';

let reply: any = null;//反馈服务器

/**
 * 仓库State
 */
interface IStoreState {
    /**
     * USB监听到的手机数据(目前至多6台)
     */
    phoneData: stPhoneInfoPara[];
    /**
     * 采集提示分类码 (弹框类型，采集时后端反馈，为空时不显示)
     */
    tipsType: AppDataExtractType | null;
    /**
     * 采集响应状态码（采集过程中对用户的提示，对应FetchResposeUI枚举）
     */
    fetchResponseCode: number;
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
}

/**
 * 初始化连接设备
 * 对应组件：view/dashboard/Init
 */
let model: IModel = {
    namespace: 'init',
    state: {
        phoneData: [],
        tipsType: null,
        fetchResponseCode: 0,
        isEmptyUnit: false,
        isEmptyOfficer: false,
        isEmptyCase: false
    },
    reducers: {
        setPhoneData(state: IObject, { payload }: IAction) {
            const tipsBackup = sessionStore.get('TIPS_BACKUP');
            if (tipsBackup && payload.length < state.phoneData.length) {
                //NOTE:USB拔出时，删除掉SessionStorage中的弹框数据（如果有）
                tipsStore.removeDiff(payload.map((item: stPhoneInfoPara) => ({ id: item.piSerialNumber! + item.piLocationID })));
            }

            let temp = payload.map((item: stPhoneInfoPara) => {
                return {
                    ...item,
                    status: item.m_ConnectSate
                }
            });
            return {
                ...state,
                phoneData: temp
            }
        },
        clearPhoneData(state: IObject) {
            sessionStore.remove('TIPS_BACKUP');
            return {
                ...state,
                phoneData: []
            }
        },
        /**
         * 设置采集状态
         * payload传手机数据（单个或数组）
         */
        setStatus(state: IObject, { payload }: IAction) {
            if (helper.isArray(payload)) {
                return {
                    ...state,
                    phoneData: [...payload]
                };
            } else {
                let { phoneData } = state;
                let updated = phoneData.map((item: IObject) => {
                    if (item.piSerialNumber === payload.piSerialNumber &&
                        item.piLocationID === payload.piLocationID) {
                        return { ...payload };
                    } else {
                        return item;
                    }
                });
                return {
                    ...state,
                    phoneData: [...updated]
                }
            }
        },
        /**
         * 设置用户弹框类型
         */
        setTipsType(state: IObject, { payload }: IAction) {
            return {
                ...state,
                tipsType: payload.tipsType
            }
        },
        /**
         * 清空用户提示（关闭提示框）
         */
        clearTipsType(state: IObject) {
            return {
                ...state,
                tipsType: null
            }
        },
        setEmptyUnit(state: IObject, { payload }: IAction) {
            return { ...state, isEmptyUnit: payload };
        },
        setEmptyOfficer(state: IObject, { payload }: IAction) {
            return { ...state, isEmptyOfficer: payload };
        },
        setEmptyCase(state: IObject, { payload }: IAction) {
            return { ...state, isEmptyCase: payload };
        },
        /**
         * 设置采集响应状态码
         */
        setFetchResponseCode(state: IObject, { payload }: IAction) {
            return {
                ...state,
                fetchResponseCode: payload
            };
        }
    },
    effects: {
        /**
         * 开始取证
         */
        *start({ payload }: IAction, { fork }: IEffects) {
            const { caseData } = payload;
            const rpc = new Rpc();
            yield fork([rpc, 'invoke'], 'Start', [caseData]);
        },
        /**
         * 用户操作完成
         */
        *operateFinished({ payload }: IAction, { fork }: IEffects) {
            const rpc = new Rpc();
            yield fork([rpc, 'invoke'], 'OperateFinished', [payload]);
        },
        /**
         * 查询案件是否为空
         */
        *queryEmptyCase({ payload }: IAction, { call, put }: IEffects) {
            const rpc = new Rpc();
            try {
                let casePath = yield call([rpc, 'invoke'], 'GetDataSavePath');
                let result = yield call([rpc, 'invoke'], 'GetCaseList', [casePath]);
                yield put({ type: 'setEmptyCase', payload: result.length === 0 });
            } catch (error) {
                console.log(`@modal/dashboard/Init/Init.ts/queryEmptyUnit:${error.message}`);
                logger.error({ message: `@modal/dashboard/Init/Init.ts/queryEmptyUnit: ${error.stack}` });
                message.error('查询案件非空失败');
            }
        },
        /**
         * 查询检验员是否为空
         */
        *queryEmptyOfficer({ payload }: IAction, { call, put }: IEffects) {
            const rpc = new Rpc();
            try {
                let result = yield call([rpc, 'invoke'], 'GetCheckerInfo', []);
                yield put({ type: 'setEmptyOfficer', payload: result.length === 0 });
            } catch (error) {
                console.log(`@modal/dashboard/Init/Init.ts/queryEmptyOfficer:${error.message}`);
                logger.error({ message: `@modal/dashboard/Init/Init.ts/queryEmptyOfficer: ${error.stack}` });
                message.error('查询检验员非空失败');
            }
        },
        /**
         * 查询检验单位是否为空
         */
        *queryEmptyUnit({ payload }: IAction, { call, put }: IEffects) {
            const rpc = new Rpc();
            try {
                let entity: CCheckOrganization = yield call([rpc, 'invoke'], 'GetCurCheckOrganizationInfo');
                if (entity.m_strCheckOrganizationName) {
                    yield put({ type: 'setEmptyUnit', payload: false });
                } else {
                    yield put({ type: 'setEmptyUnit', payload: true });
                }
            } catch (error) {
                console.log(`@modal/dashboard/Init/Init.ts/queryEmptyUnit:${error.message}`);
                logger.error({ message: `@modal/dashboard/Init/Init.ts/queryEmptyUnit: ${error.stack}` });
                message.error('查询检验单位非空失败');
            }
        }
    },
    subscriptions: {
        /**
         * 监听远程RPC反馈数据
         * LEGACY:后期会改为RPC反向调用
         */
        startService({ history, dispatch }: ISubParam) {
            if (helper.isNullOrUndefined(reply)) {
                reply = new Reply([
                    /**
                     * 连接设备的反馈，当插拔USB时后台会推送数据
                     * @param args stPhoneInfoPara数组
                     */
                    function receiveUsb(args: stPhoneInfoPara[]) {
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
                            Brand: phoneInfo.piBrand!
                        });
                        ipcRenderer.send('show-notice', { title: '备份提示', message: `请点击「消息」链接按步骤对${phoneInfo.piBrand}设备进行备份` });
                        dispatch({
                            type: 'setTipsType', payload: {
                                tipsType: type
                            }
                        });
                    },
                    /**
                     * 用户确认反馈
                     * @param code 
                     */
                    function userConfirm(id: string, code: FetchResposeUI) {
                        dispatch({ type: 'setFetchResponseCode', payload: code });
                        console.log('用户确认反馈', code);
                    }
                ]);
            }
        },
        /**
         * 连接远程RPC服务器
         */
        connectRpcServer({ dispatch }: ISubParam) {
            const { ip, replyPort } = config as any;
            const rpc = new Rpc();
            rpc.invoke('ConnectServer', [ip, replyPort]).then((isConnected: boolean) => {
                if (isConnected) {
                    console.clear();
                    console.log('成功连接RPC服务');
                }
                return rpc.invoke('GetDevlist', []);
            }).then((args: stPhoneInfoPara[]) => {
                if (args && args.length > 0) {
                    dispatch({ type: 'setPhoneData', payload: args });
                } else {
                    dispatch({ type: 'clearPhoneData' });
                }
            }).catch((err) => {
                logger.error({ message: `@model/Init.ts/connectRpcServer: ${err.message}` });
            });
        }
    }
}

export { IStoreState };
export default model;