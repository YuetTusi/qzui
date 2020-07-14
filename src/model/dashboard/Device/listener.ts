import { Dispatch } from "redux";
import { ipcRenderer } from "electron";
import { Command } from "@src/schema/socket/Command";
import DeviceType from "@src/schema/socket/DeviceType";
import { FetchState } from "@src/schema/socket/DeviceState";
import { caseStore } from "@src/utils/localStore";

/**
 * 设备状态变化
 * @param dispatch 
 */
export function deviceChange({ cmd, msg }: Command<DeviceType>, dispatch: Dispatch<any>) {
    if (msg?.fetchState !== FetchState.Fetching) {
        //NOTE:停止计时
        ipcRenderer.send('time', msg?.usb! - 1, false);
    }
    if (msg?.fetchState === FetchState.Finished || msg?.fetchState === FetchState.HasError) {
        //#记录日志
        dispatch({
            type: 'saveFetchLog', payload: {
                usb: msg?.usb,
                state: msg?.fetchState
            }
        });
    }
    dispatch({
        type: 'updateProp', payload: {
            usb: msg?.usb,
            name: 'fetchState',
            value: msg?.fetchState
        }
    });
}

/**
 * 设备拔出
 */
export function deviceOut({ cmd, msg }: Command<DeviceType>, dispatch: Dispatch<any>) {
    console.log(`接收到设备断开:${JSON.stringify(msg)}`);
    //NOTE:停止计时
    ipcRenderer.send('time', msg?.usb! - 1, false);
    //NOTE:清理案件数据
    caseStore.remove(msg?.usb!);
    dispatch({ type: 'removeDevice', payload: msg?.usb });
}