import { IModel, ISubParam, IObject, IAction } from '@type/model';
import Rpc from '@src/service/rpc';
import { polling } from '@utils/polling';
import { PhoneInfoStatus } from '@src/components/PhoneInfo/PhoneInfoStatus';
import { helper } from '@src/utils/helper';

const rpc = new Rpc();
let pause = false; //暂停标志，当手机处于采集中暂停渲染
/**
 * 初始化连接设备
 * 对应组件：view/dashboard/Init
 */
let model: IModel = {
    namespace: 'init',
    state: {
        //USB监听到的手机数据(目前至多6台)
        phoneData: []
    },
    reducers: {
        setPhoneData(state: IObject, action: IAction) {
            // console.log(action.payload);
            return {
                ...state,
                phoneData: [...action.payload]
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
            return {
                ...state,
                phoneData: [...action.payload]
            };
        },
        setPause(state: IObject, action: IAction) {
            pause = action.payload;
            return state;
        }
    },
    subscriptions: {
        /**
         * 监听USB连接设备，成功连接获取数据
         * 调用RPC接口GetDevlist
         */
        listenUsb({ dispatch }: ISubParam) {

            polling(async () => {
                // console.log(pause);

                try {
                    let phoneData: any[] = await rpc.invoke("GetDevlist");
                    if (phoneData && phoneData.length > 0) {
                        phoneData = phoneData.map((item: IObject) => ({
                            ...item,
                            status: PhoneInfoStatus.CONNECTED
                        })); //将识别的手机状态置为"已连接"
                        if (!pause) {
                            dispatch({ type: 'setPhoneData', payload: phoneData });
                        }

                    } else {
                        //USB已断开
                        dispatch({ type: 'clearPhoneData' });
                    }
                    return true;
                } catch (error) {
                    console.log('@Init.ts GetDevlist方法调用失败', error);
                    return true;
                }

            });
        }
    }
}

export default model;