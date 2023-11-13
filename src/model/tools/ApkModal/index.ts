import { Model } from 'dva';
import reducers from './reducers';
import effects from './effects';

interface Apk {
    /**
     * USB号
     */
    id: string,
    /**
     * 名称
     */
    name: string,
    /**
     * 值，包名
     */
    value: string
}

/**
 * 手机
 */
interface Phone {
    /**
     * id
     */
    id: string,
    /**
     * 手机名称
     */
    name: string,
    /**
     * 值
     */
    value: string
}

interface ApkModalState {

    phone: Phone[],
    apk: Apk[],
    message: string[]
}

/**
 * 工具箱apk提取弹框
 */
let model: Model = {
    namespace: 'apkModal',
    state: {
        apk: [
            // {
            //     "id": "2",
            //     "name": "com.tencent.mm",
            //     "value": "微信"
            // },
            // {
            //     "id": "3",
            //     "name": "com.huawei.hisuite",
            //     "value": ""
            // },
            // {
            //     "id": "4",
            //     "name": "com.woyue.batchat",
            //     "value": "test"
            // }
        ],
        phone: [
            // { "name": "usb: 1, EVA-AL10", "value": 1, "id": '2' }
        ],
        message: []
    },
    reducers,
    effects
};

export { Apk, Phone, ApkModalState };
export default model;