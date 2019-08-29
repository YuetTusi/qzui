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
        //设备ID（手机唯一标识）
        m_nDevID: null,
        //手机品牌
        piMakerName: null,
        //型号
        piPhoneType: null
    },
    reducers: {
        setPhoneData(state: IObject, action: IAction) {
            return {
                ...state,
                m_nDevID: action.payload.m_nDevID,
                piMakerName: action.payload.piMakerName,
                piPhoneType: action.payload.piPhoneType
            }
        },
        clearPhoneData(state: IObject, action: IAction) {
            return {
                ...state,
                m_nDevID: null,
                piMakerName: null,
                piPhoneType: null
            }
        }
    },
    subscriptions: {
        /**
         * 监听USB连接设备，成功连接获取数据
         * 调用RPC接口GetDevlist
         */
        listenUsb({ dispatch }: ISubParam) {
            // polling(async () => {
            //     try {
            //         let phoneData: any[] = await rpc.invoke("GetDevlist");
            //         if (phoneData && phoneData.length > 0) {
            //             console.log(phoneData);
            //             dispatch({ type: 'setPhoneData', payload: phoneData[0] });
            //         } else {
            //             //USB已断开
            //             dispatch({ type: 'clearPhoneData' });
            //         }
            //         return true;
            //     } catch (error) {
            //         console.log(error);
            //         return true;
            //     }
            // });
        }
    }
}

export default model;