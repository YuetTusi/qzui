import { Dispatch } from "redux";
import { ipcRenderer } from "electron";
import { Command } from "@src/schema/socket/Command";
import DeviceType from "@src/schema/socket/DeviceType";
import { FetchState } from "@src/schema/socket/DeviceState";
import { caseStore } from "@src/utils/localStore";
import { FetchProgress } from "@src/schema/socket/FetchRecord";

/**
 * 设备状态变化
 * @param dispatch 
 */
export function deviceChange({ msg }: Command<DeviceType>, dispatch: Dispatch<any>) {
    if (msg.fetchState !== FetchState.Fetching) {
        //NOTE:停止计时
        ipcRenderer.send('time', msg.usb! - 1, false);
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
    dispatch({
        type: 'setRecordToDevice', payload: {
            usb: msg.usb,
            fetchRecord: { type: msg.type, info: msg.info }
        }
    });
}