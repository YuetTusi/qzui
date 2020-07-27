import { Dispatch } from "redux";
import { ipcRenderer, remote } from "electron";
import { Command } from "@src/schema/socket/Command";
import DeviceType from "@src/schema/socket/DeviceType";
import { FetchState } from "@src/schema/socket/DeviceState";
import { caseStore } from "@src/utils/localStore";
import { FetchProgress } from "@src/schema/socket/FetchRecord";
import GuideImage from "@src/schema/socket/GuideImage";
import { helper } from "@src/utils/helper";
import TipType from "@src/schema/socket/TipType";

/**
 * 设备状态变化
 * @param dispatch 
 */
export function deviceChange({ msg }: Command<DeviceType>, dispatch: Dispatch<any>) {
    if (msg.fetchState !== FetchState.Fetching) {
        //NOTE:停止计时
        ipcRenderer.send('time', msg.usb! - 1, false);
        dispatch({ type: 'clearTip', payload: msg.usb });
        dispatch({
            type: 'updateProp', payload: {
                usb: msg.usb,
                name: 'isStopping',
                value: false
            }
        });
    }
    if (msg.fetchState === FetchState.Finished || msg.fetchState === FetchState.HasError) {
        //发送Windows消息
        ipcRenderer.send('show-notice', {
            message: `终端${msg.usb}-「${msg.manufacturer}」手机采集完成`
        });
        //#记录日志
        dispatch({
            type: 'saveFetchLog', payload: {
                usb: msg.usb,
                state: msg.fetchState
            }
        });
    }
    dispatch({
        type: 'updateProp', payload: {
            usb: msg.usb,
            name: 'fetchState',
            value: msg.fetchState
        }
    });
}

/**
 * 设备拔出
 */
export function deviceOut({ msg }: Command<DeviceType>, dispatch: Dispatch<any>) {
    console.log(`接收到设备断开:${JSON.stringify(msg)}`);
    //NOTE:清除采集日志
    ipcRenderer.send('progress-clear', msg.usb);
    //NOTE:停止计时
    ipcRenderer.send('time', msg.usb! - 1, false);
    //NOTE:清理案件数据
    caseStore.remove(msg.usb!);
    dispatch({ type: 'removeDevice', payload: msg.usb });
}

/**
 * 接收采集进度消息
 * @param msg.usb 为序号
 * @param msg.type 为分类，非0的数据入库
 * @param msg.info 消息内容
 */
export function fetchProgress({ msg }: Command<FetchProgress>, dispatch: Dispatch<any>) {
    ipcRenderer.send('fetch-progress', {
        usb: msg.usb,
        fetchRecord: { type: msg.type, info: msg.info, time: new Date() }
    });
    remote.getCurrentWebContents().send('fetch-progress', {
        usb: msg.usb,
        fetchRecord: { type: msg.type, info: msg.info, time: new Date() }
    });
}

/**
 * 接收用户消息（闪烁消息）
 */
export function tipMsg({ msg }: Command<{ usb: number, info: string, type: GuideImage, required: boolean }>,
    dispatch: Dispatch<any>) {
    ipcRenderer.send('show-notification', {
        message: `「终端${msg.usb}」有新消息`
    });

    let tipType = TipType.Nothing;
    if (helper.isNullOrUndefinedOrEmptyString(msg.type)) {
        //#无图，是问题类消息
        tipType = TipType.Question;
    } else if (msg.required) {
        //#有图，必回复消息
        tipType = TipType.RequiredGuide;
    } else {
        //#有图，可不回复
        tipType = TipType.Guide;
    }

    dispatch({
        type: 'setTip', payload: {
            usb: msg.usb,
            tipType,
            tipMsg: msg.info,
            tipImage: msg.type,
            tipRequired: msg.required
        }
    });
}