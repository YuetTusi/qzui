import { ipcRenderer, IpcRendererEvent } from 'electron';
import { SubscriptionAPI } from 'dva';
import Modal from 'antd/lib/modal';
import Db from '@utils/db';
import { helper } from '@utils/helper';
import logger from '@utils/log';
import server, { send } from '@src/service/tcpServer';
import TipType from '@src/schema/socket/TipType';
import { TableName } from '@src/schema/db/TableName';
import { FetchLog } from '@src/schema/socket/FetchLog';
import CommandType, { SocketType, Command } from '@src/schema/socket/Command';
import { deviceChange, deviceOut, fetchProgress, tipMsg } from './listener';

const { Fetch, Parse } = SocketType;
const deviceCount: number = helper.readConf().max;

/**
 * 订阅
 */
export default {
    /**
     * 接收设备连接信息
     */
    receiveDevice({ dispatch }: SubscriptionAPI) {

        server.on(Fetch, (command: Command) => {

            switch (command.cmd) {
                case CommandType.Connect:
                    //#Socket连入后，告知采集路数
                    send(Fetch, {
                        type: Fetch,
                        cmd: CommandType.ConnectOK,
                        msg: { count: deviceCount }
                    });
                    break;
                case CommandType.DeviceIn:
                    console.log(`接收到设备连入:${JSON.stringify(command.msg)}`);
                    logger.info(`设备连入(DeviceIn)：${JSON.stringify(command.msg)}`);
                    dispatch({
                        type: 'setDeviceToList', payload: {
                            ...command.msg,
                            tipType: TipType.Nothing
                        }
                    });
                    break;
                case CommandType.DeviceChange:
                    console.log(`设备状态更新:${JSON.stringify(command.msg)}`);
                    logger.info(`设备状态更新(DeviceChange)：${JSON.stringify(command.msg)}`);
                    deviceChange(command, dispatch);
                    break;
                case CommandType.FetchProgress:
                    console.log(`采集进度消息：${JSON.stringify(command.msg)}`);
                    logger.info(`采集进度消息：${JSON.stringify(command.msg)}`);
                    fetchProgress(command, dispatch);
                    break;
                case CommandType.DeviceOut:
                    logger.info(`设备移除(DeviceOut)：${JSON.stringify(command.msg)}`);
                    deviceOut(command, dispatch);
                    break;
                case CommandType.UserAlert:
                    Modal.destroyAll();
                    Modal.warning({
                        title: '警告',
                        content: '此手机USB冲突',
                        okText: '确定'
                    });
                    break;
                case CommandType.TipMsg:
                    console.log(`用户消息提示：${JSON.stringify(command.msg)}`);
                    logger.info(`接收消息(TipMsg)：${JSON.stringify(command.msg)}`);
                    tipMsg(command, dispatch);
                    break;
                case CommandType.TipClear:
                    console.log(`清理${command.msg.usb}消息`);
                    dispatch({ type: 'clearTip', payload: command.msg.usb });
            }
        });
        server.on(Parse, (command: Command) => {
            switch (command.cmd) {
                case CommandType.Connect:
                    console.log('解析Socket已连入');
                    break;
            }
        });
    },
    /**
     * 接收主进程日志数据入库
     */
    saveFetchLog({ dispatch }: SubscriptionAPI) {
        const db = new Db<FetchLog>(TableName.FetchLog);
        ipcRenderer.on('save-fetch-log', (event: IpcRendererEvent, log: FetchLog) => {
            db.insert(log).catch((err) => {
                logger.error(`采集进度入库失败 @model/dashboard/Device/subscriptions/saveFetchLog: ${err.message}`);
            });
        });
    },
    // mock({ dispatch }: SubscriptionAPI) {
    //     setInterval(() => {
    //         dispatch({ type: 'progressModal/setInfo', payload: `正在解析_${Math.random().toString()}` });
    //     }, 1000)
    // }
}