import { Model } from 'dva';
import reducers from './reducers';
import effects from './effects';
import { CaptchaMsg } from '@src/components/guide/CloudCodeModal/CloudCodeModalType';
import { helper } from '@src/utils/helper';

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
     * 应用列表，根据USB序号对应设备
     * * 例如数组中第2个元素的AppCodeItem表示第3个手机的应用进度(usb-1)
     */
    devices: Array<{ apps: Array<OneCloudApp> }>
}

/*
# 数据结构举例：
[
    {
        apps:[{
            m_strID:"15032",
            m_strPktlist:["包名"],
            message:[{content:"进度消息1",type:0,actionTime:Date()}],
            disabled:false
        },{
            m_strID:"15033",
            m_strPktlist:["包名"],
            message:[{content:"进度消息1",type:0,actionTime:Date()},{content:"进度消息2",type:0,actionTime:Date()}],
            disabled:true
        }],
    },{
	
    }
]
 */

interface OneCloudApp {
    /**
     * AppID
     */
    m_strID: string,
    /**
     * App包名列表
     */
    m_strPktlist: string[],
    /**
     * 详情消息
     */
    message: CaptchaMsg[],
    /**
     * 是否禁用
     */
    disabled: boolean,
    /**
     * 是否成功
     */
    state: CloudAppState;
}

enum CloudAppState {
    /**
     * 采集中
     */
    Fetching,
    /**
     * 成功
     */
    Success,
    /**
     * 失败
     */
    Error
}

/**
 * 云取证验证码输入框
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

export { CloudCodeModalStoreState, OneCloudApp, CloudAppState };
export default model;