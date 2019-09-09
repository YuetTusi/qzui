import { IModel, ISubParam, IObject, IAction, IEffects } from '@type/model';
import Rpc from '@src/service/rpc';
import { message } from 'antd';
import { polling } from '@utils/polling';
import { PhoneInfoStatus } from '@src/components/PhoneInfo/PhoneInfoStatus';
import { helper } from '@src/utils/helper';
import Reply from '@src/service/reply';
import { stPhoneInfoPara } from '@src/schema/stPhoneInfoPara';

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
        //品牌步骤(采集时后端反馈)
        brandStep: null
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
                        return item.piSerialNumber === phoneData.piSerialNumber;
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
                        if (item.piSerialNumber === action.payload[i].piSerialNumber) {
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
        setStepBrand(state: IObject, action: IAction) {
            return {
                ...state,
                brandStep: action.payload
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
        }
    },
    subscriptions: {
        /**
         * 监听USB连接设备，成功连接获取数据
         * 调用RPC接口GetDevlist
         */
        listenUsb({ dispatch }: ISubParam) {

            polling(async () => {
                try {
                    let phoneData: any[] = await rpc.invoke("GetDevlist");
                    if (phoneData && phoneData.length > 0) {
                        dispatch({ type: 'setPhoneData', payload: phoneData });
                    } else {
                        //USB已断开
                        dispatch({ type: 'clearPhoneData' });
                    }
                    return true;
                } catch (error) {
                    console.log('@Init.ts GetDevlist方法调用失败', error);
                    message.error('采集程序连接失败');
                    return false;
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
                             * 手机品牌反馈数据
                             */
                            function phoneBrandBack(type: string) {
                                //弹出对应的步骤窗口
                                dispatch({ type: 'setStepBrand', payload: type });
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
        }
    }
}

export default model;