import { Model } from 'dva';
import reducers from './reducers';
import effects from './effects';
import { helper } from '@src/utils/helper';
import { CloudAppMessages } from '@src/schema/socket/CloudAppMessages';

const { max } = helper.readConf();

interface CloudCodeModalStoreState {
    /**
     * 是否显示
     */
    visible: boolean,
    /**
     * 当前USB序号
     */
    usb: number,
    /**
     * 持有人
     */
    mobileHolder: string,
    /**
     * 手机号
     */
    mobileNumber: string,
    /**
     * 应用列表，根据USB序号对应设备
     * * 例如数组中第2个元素的AppCodeItem表示第3个手机的应用进度(usb-1)
     */
    devices: Array<{ apps: Array<CloudAppMessages> }>
}

/*
# 数据结构举例：
[
    {
        apps:[{
            m_strID:"15032",
            key:"imo",
            message:[{content:"进度消息1",type:0,actionTime:Date()}],
            disabled:false,
            state:0
        },{
            m_strID:"15033",
            key:"whatsapp",
            message:[{content:"进度消息1",type:0,actionTime:Date()},{content:"进度消息2",type:0,actionTime:Date()}],
            disabled:true,
            state:0
        }],
    },
    //...
]
 */


/**
 * 云取证验证码输入框Model
 * 对应组件为：src/components/guide/CloudCodeModal
 */
let model: Model = {
    namespace: 'cloudCodeModal',
    state: {
        visible: false,
        usb: 0,
        devices: new Array(max)
    },
    reducers,
    effects
}

export { CloudCodeModalStoreState };
export default model;