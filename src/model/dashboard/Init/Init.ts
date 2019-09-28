import { IModel, ISubParam, IObject, IAction, IEffects } from '@type/model';
import Rpc from '@src/service/rpc';
import { message } from 'antd';
import { polling } from '@utils/polling';
import { ipcRenderer, IpcMessageEvent } from 'electron';
import { PhoneInfoStatus } from '@src/components/PhoneInfo/PhoneInfoStatus';
import { helper } from '@src/utils/helper';
import Reply from '@src/service/reply';
import { stPhoneInfoPara } from '@src/schema/stPhoneInfoPara';
import { AppDataExtractType } from '@src/schema/AppDataExtractType';

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
        //用户提示弹框类型(采集时后端反馈)
        tipsType: null,
        //当前采集手机的序列号
        piSerialNumber: '',
        //当前采集手机的物理USB端口
        piLocationID: '',
        //采集单位是否为空
        isEmptyUnit: false,
        //警员信息是否为空
        isEmptyPolice: false,
        //案件信息是否为空
        isEmptyCase: false
    },
    reducers: {
        setPhoneData(state: IObject, action: IAction) {
            let temp = [];
            if (state.phoneData.length === 0) {
                temp = action.payload.map((item: stPhoneInfoPara) => {
                    return { ...item, status: PhoneInfoStatus.CONNECTED }
                });
            } else if (action.payload.length > state.phoneData.length) {
                //连入了一部设备
                temp = [...state.phoneData];
                action.payload.forEach((item: stPhoneInfoPara) => {
                    let exist = state.phoneData.find((phoneData: IObject) => {
                        //目前以piSerialNumber + piLocationID验证手机唯一
                        return (item.piSerialNumber === phoneData.piSerialNumber &&
                            item.piLocationID === phoneData.piLocationID);
                    });
                    if (exist === undefined) {
                        temp.push({
                            ...item,
                            status: PhoneInfoStatus.CONNECTED
                        });
                    }
                });
            } else {
                //移除了一部设备
                temp = state.phoneData.filter((item: IObject) => {
                    let exist = false;
                    for (let i = 0; i < action.payload.length; i++) {
                        if (item.piSerialNumber === action.payload[i].piSerialNumber
                            && item.piLocationID === action.payload[i].piLocationID) {
                            exist = true;
                            break;
                        }
                    }
                    return exist;
                });
            }
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
                    if (item.piSerialNumber === action.payload.piSerialNumber) {
                        return { ...item, status: PhoneInfoStatus.FINISH };
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
         * 清空用户提示数据
         */
        clearTipsType(state: IObject, action: IAction) {
            return {
                ...state,
                tipsType: null,
                piLocationID: '',
                piSerialNumber: ''
            }
        }
    },
    effects: {
        /**
         * 开始取证
         */
        *startCollect(action: IAction, { fork }: IEffects) {
            yield fork([rpc, 'invoke'], 'Start', [
                [action.payload]
            ]);
        },
        /**
         * 操作完成
         */
        *operateFinished(action: IAction, { fork }: IEffects) {
            yield fork([rpc, 'invoke'], 'OperateFinished', [
                action.payload
            ]);
        }
    },
    subscriptions: {
        /**
         * 监听USB连接设备，成功连接获取数据
         * 调用RPC接口GetDevlist
         */
        listeningUsb({ dispatch }: ISubParam) {

            ipcRenderer.send('listening-usb');
            ipcRenderer.on('receive-listening-usb', (event: IpcMessageEvent, args: any[]) => {
                console.log(args);
                if (args && args.length > 0) {
                    dispatch({ type: 'setPhoneData', payload: args });
                } else {
                    //USB已断开
                    dispatch({ type: 'clearPhoneData' });
                }
            });

            // polling(async () => {
            //     try {
            //         let phoneData: any[] = await rpc.invoke("GetDevlist");
            //         if (phoneData && phoneData.length > 0) {
            //             // console.log(phoneData);
            //             dispatch({ type: 'setPhoneData', payload: phoneData });
            //         } else {
            //             //USB已断开
            //             dispatch({ type: 'clearPhoneData' });
            //         }
            //         return true;
            //     } catch (error) {
            //         console.log('@Init.ts GetDevlist方法调用失败', error);
            //         message.error('采集程序连接失败');
            //         return false;
            //     }
            // });
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
                             * @param type 提示类型枚举
                             * @param phoneInfo 手机采集数据
                             */
                            function tipsBack(phoneInfo: stPhoneInfoPara, type: AppDataExtractType) {
                                //弹出对应的提示窗口
                                // console.log('tipsBack');
                                // console.log(type);
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