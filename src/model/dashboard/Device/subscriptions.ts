import { ipcRenderer } from 'electron';
import { SubscriptionAPI } from 'dva';
import { helper } from '@src/utils/helper';
import server, { send } from '@src/service/tcpServer';
import { DeviceType } from '@src/schema/socket/DeviceType';
import CommandType, { SocketType, Command } from '@src/schema/socket/Command';
import { caseStore } from '@src/utils/localStore';
import { FetchState } from '@src/schema/socket/DeviceState';
import { FetchLogState } from '@src/schema/socket/FetchLog';

const deviceCount: number = helper.readConf().max;

/**
 * 订阅
 */
export default {
    /**
     * 接收设备连接信息
     */
    receiveDevice({ dispatch }: SubscriptionAPI) {

        server.on(SocketType.Fetch, ({ cmd, msg }: Command<DeviceType>) => {

            switch (cmd) {
                case CommandType.Connect:
                    let cmd: Command = {
                        type: SocketType.Fetch,
                        cmd: CommandType.ConnectOK,
                        msg: { count: deviceCount }
                    };
                    //#Socket连入后，告知采集路数
                    send(SocketType.Fetch, cmd);
                    break;
                case CommandType.DeviceIn:
                    console.log(`接收到设备连入:${JSON.stringify(msg)}`);
                    dispatch({ type: 'setDeviceToList', payload: msg });
                    break;
                case CommandType.DeviceChange:
                    console.log(`设备状态变化:${JSON.stringify(msg)}`);
                    if (msg?.fetchState !== FetchState.Fetching) {
                        //NOTE:停止计时
                        ipcRenderer.send('time', msg?.usb! - 1, false);
                    }
                    if (msg?.fetchState === FetchState.Finished) {
                        //#记录日志
                        dispatch({
                            type: 'saveFetchLog', payload: {
                                usb: msg?.usb,
                                state: FetchLogState.Success
                            }
                        });
                    }
                    if (msg?.fetchState === FetchState.HasError) {
                        //#记录日志
                        dispatch({
                            type: 'saveFetchLog', payload: {
                                usb: msg?.usb,
                                state: FetchLogState.Error
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
                    break;
                case CommandType.DeviceOut:
                    console.log(`接收到设备断开:${JSON.stringify(msg)}`);
                    //NOTE:停止计时
                    ipcRenderer.send('time', msg?.usb! - 1, false);
                    //NOTE:清理案件数据
                    caseStore.remove(msg?.usb!);
                    dispatch({ type: 'removeDevice', payload: msg?.usb });
                    break;
            }
        });
    },
}