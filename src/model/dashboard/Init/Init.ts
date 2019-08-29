import { IModel, ISubParam, IObject, IAction } from '@type/model';
import Rpc from '@src/service/rpc';
import { polling } from '@utils/polling';

const rpc = new Rpc();

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
                    console.log(error);
                    return true;
                }
            });
        }
    }
}

export default model;