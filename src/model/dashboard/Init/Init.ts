import { IModel, ISubParam, IObject, IAction, IEffects } from '@type/model';
import Rpc from '@src/service/rpc';
import { message } from 'antd';
// import { polling } from '@utils/polling';
import { ipcRenderer, IpcMessageEvent } from 'electron';
import { PhoneInfoStatus } from '@src/components/PhoneInfo/PhoneInfoStatus';
import { helper } from '@src/utils/helper';
import Reply from '@src/service/reply';
import { stPhoneInfoPara } from '@src/schema/stPhoneInfoPara';
import { AppDataExtractType } from '@src/schema/AppDataExtractType';
import { CFetchCorporation } from '@src/schema/CFetchCorporation';


const rpc = new Rpc();
let reply: any = null;//反馈服务器

/**
 * 初始化连接设备
 * 对应组件：view/dashboard/Init
 */
let model: IModel = {
    namespace: 'init',
    state: {
        //USB监听到的手机数据(目前至多6台)
        phoneData: [],
        //用户提示弹框类型(采集时后端反馈，为空时不显示)
        tipsType: null,
        //当前采集手机的序列号
        piSerialNumber: '',
        //当前采集手机的物理USB端口
        piLocationID: '',
        //采集单位是否为空
        isEmptyUnit: false,
        //检验员信息是否为空
        isEmptyOfficer: false,
        //案件信息是否为空
        isEmptyCase: false
    },
    reducers: {
        setPhoneData(state: IObject, action: IAction) {
            let temp = action.payload.map((item: stPhoneInfoPara) => {
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
        clearPhoneData(state: IObject, action: IAction) {
            return {
                ...state,
                phoneData: []
            }
        },
        /**
         * 设置采集状态
         * payload传手机数据（单个或数组）
         */
        setStatus(state: IObject, action: IAction) {
            if (helper.isArray(action.payload)) {
                return {
                    ...state,
                    phoneData: [...action.payload]
                };
            } else {
                let { phoneData } = state;
                let updated = phoneData.map((item: IObject) => {
                    if (item.piSerialNumber === action.payload.piSerialNumber &&
                        item.piLocationID === action.payload.piLocationID) {
                        return { ...item, status: PhoneInfoStatus.FETCHING };
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
        setTipsType(state: IObject, action: IAction) {
            return {
                ...state,
                tipsType: action.payload.tipsType,
                piLocationID: action.payload.piLocationID,
                piSerialNumber: action.payload.piSerialNumber
            }
        },
        /**
         * 清空用户提示（关闭提示框）
         */
        clearTipsType(state: IObject, action: IAction) {
            return {
                ...state,
                tipsType: null,
                piLocationID: '',
                piSerialNumber: ''
            }
        },
        setEmptyUnit(state: IObject, action: IAction) {
            return { ...state, isEmptyUnit: action.payload };
        },
        setEmptyOfficer(state: IObject, action: IAction) {
            return { ...state, isEmptyOfficer: action.payload };
        },
        setEmptyCase(state: IObject, action: IAction) {
            return { ...state, isEmptyCase: action.payload };
        }
    },
    effects: {
        /**
         * 开始取证
         */
        *start({ payload }: IAction, { fork }: IEffects) {
            yield fork([rpc, 'invoke'], 'Start', [
                [payload.phoneInfo], payload.caseData
            ]);
        },
        /**
         * 操作完成
         */
        *operateFinished(action: IAction, { fork }: IEffects) {
            yield fork([rpc, 'invoke'], 'OperateFinished', [
                action.payload
            ]);
        },
        /**
         * 查询案件是否为空
         */
        *queryEmptyCase(action: IAction, { call, put }: IEffects) {
            try {
                let casePath = yield call([rpc, 'invoke'], 'GetDataSavePath');
                let result = yield call([rpc, 'invoke'], 'GetCaseList', [casePath]);
                yield put({ type: 'setEmptyCase', payload: result.length === 0 });
            } catch (error) {
                console.log(`@modal/dashboard/Init/Init.ts/queryEmptyUnit:${error.message}`);
                message.error('查询案件非空失败');
            }
        },
        /**
         * 查询检验员是否为空
         */
        *queryEmptyOfficer(action: IAction, { call, put }: IEffects) {
            try {
                let result = yield call([rpc, 'invoke'], 'GetCoronerInfo', []);
                yield put({ type: 'setEmptyOfficer', payload: result.length === 0 });
            } catch (error) {
                console.log(`@modal/dashboard/Init/Init.ts/queryEmptyOfficer:${error.message}`);
                message.error('查询检验员非空失败');
            }
        },
        /**
         * 查询检验单位是否为空
         */
        *queryEmptyUnit(action: IAction, { call, put }: IEffects) {
            try {
                let entity: CFetchCorporation = yield call([rpc, 'invoke'], 'GetFetchCorpInfo');
                if (entity.m_strName) {
                    yield put({ type: 'setEmptyUnit', payload: false });
                } else {
                    yield put({ type: 'setEmptyUnit', payload: true });
                }
            } catch (error) {
                console.log(`@modal/dashboard/Init/Init.ts/queryEmptyUnit:${error.message}`);
                message.error('查询检验单位非空失败');
            }
        }
    },
    subscriptions: {
        /**
         * 取USB连接设备，成功连接获取数据
         * 监听主进程receive-listening-usb事件，获取数据
         */
        listeningUsb({ dispatch }: ISubParam) {

            console.clear();
            ipcRenderer.send('listening-usb');
            ipcRenderer.on('receive-listening-usb', (event: IpcMessageEvent, args: any[]) => {
                if (args && args.length > 0) {
                    dispatch({ type: 'setPhoneData', payload: args });
                } else {
                    //USB已断开
                    dispatch({ type: 'clearPhoneData' });
                }
            });
        },
        /**
         * 监听远程RPC反馈数据
         */
        startService({ history, dispatch }: ISubParam) {
            history.listen(({ pathname }: IObject) => {
                if (pathname === '/') {
                    if (helper.isNullOrUndefined(reply)) {
                        reply = new Reply([
                            /**
                             * 采集反馈数据
                             * @param {stPhoneInfoPara} data 后端反馈的结构体
                             */
                            function collectBack(phoneInfo: stPhoneInfoPara): void {
                                dispatch({ type: 'setStatus', payload: phoneInfo });
                            },
                            /**
                             * 用户提示反馈数据
                             * @param phoneInfo 手机采集数据
                             * @param type 提示类型枚举
                             */
                            function tipsBack(phoneInfo: stPhoneInfoPara, type: AppDataExtractType): void {
                                //弹出对应的提示窗口
                                console.log('反馈了...................');
                                console.log('tipsBack');
                                console.log(type);
                                dispatch({
                                    type: 'setTipsType', payload: {
                                        tipsType: type,
                                        piSerialNumber: phoneInfo.piSerialNumber,
                                        piLocationID: phoneInfo.piLocationID
                                    }
                                });
                            }
                        ]);
                    }
                } else {
                    if (!helper.isNullOrUndefined(reply)) {
                        //停掉服务
                        reply.close();
                        reply = null;
                    }
                }
            });
        },
        // testProvide() {
        //     rpc.provide([
        //         function test() {
        //             console.log('abc');
        //         }
        //     ]);
        // }
    }
}

export default model;