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
import { ParseState } from '@src/schema/socket/DeviceState';
import {
    deviceChange, deviceOut, fetchProgress, tipMsg, extraMsg, parseCurinfo,
    parseEnd, backDatapass, saveCaseFromPlatform, importErr
} from './listener';

const { Fetch, Parse, Bho, Error } = SocketType;
const deviceCount: number = helper.readConf().max;

/**
 * 订阅
 */
export default {
    /**
     * 接收Fetch信息
     */
    receiveFetch({ dispatch }: SubscriptionAPI) {

        server.on(Fetch, (command: Command) => {

            switch (command.cmd) {
                case CommandType.Connect:
                    //#Socket连入后，告知采集路数
                    logger.info(`Fetch Connect`);
                    send(Fetch, {
                        type: Fetch,
                        cmd: CommandType.ConnectOK,
                        msg: { count: deviceCount }
                    });
                    break;
                case CommandType.DeviceIn:
                    console.log(`接收到设备连入:${JSON.stringify(command.msg)}`);
                    logger.info(`设备连入(DeviceIn)：${JSON.stringify(command.msg)}`);
                    dispatch({ type: 'checkWhenDeviceIn', payload: { usb: command.msg?.usb } });
                    dispatch({
                        type: 'setDeviceToList', payload: {
                            ...command.msg,
                            tipType: TipType.Nothing,
                            parseState: ParseState.NotParse,
                            isStopping: false
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
                    console.log(`清理USB-${command.msg.usb}消息`);
                    logger.info(`清理消息(TipClear): USB-${command.msg.usb}`);
                    dispatch({ type: 'clearTip', payload: command.msg.usb });
                    break;
                case CommandType.ExtraMsg:
                    console.log(`多用户/隐私空间消息：${JSON.stringify(command.msg)}`);
                    logger.info(`多用户/隐私空间消息(ExtraMsg)：${JSON.stringify(command.msg)}`);
                    extraMsg(command, dispatch);
                    break;
                case CommandType.CrackList:
                    //# 接收破解设备列表
                    console.log(`接收到破解列表: ${command.msg}`);
                    dispatch({ type: 'crackModal/setDev', payload: command.msg });
                    break;
                case CommandType.CrackMsg:
                    //# 接收破解设备消息
                    console.log(`接收到破解消息: ${command.msg}`);
                    dispatch({ type: 'crackModal/setMessage', payload: command.msg });
                    break;
                default:
                    console.log('未知命令:', command.cmd);
                    break;
            }
        });
    },
    /**
     * 接收Parse消息
     */
    receiveParse({ dispatch }: SubscriptionAPI) {
        server.on(Parse, (command: Command) => {
            switch (command.cmd) {
                case CommandType.Connect:
                    logger.info(`Parse Connect`);
                    send(Parse, {
                        type: Parse,
                        cmd: CommandType.ConnectOK,
                        msg: { count: deviceCount }
                    });
                    break;
                case CommandType.ParseCurinfo:
                    //# 解析详情
                    console.log(command.msg);
                    parseCurinfo(command, dispatch);
                    break;
                case CommandType.ParseEnd:
                    //# 解析结束
                    parseEnd(command, dispatch);
                    break;
                case CommandType.BackDatapass:
                    //# 输入备份密码
                    backDatapass(command, dispatch);
                    break;
                case CommandType.ImportErr:
                    //# 导入第三方数据失败
                    importErr(command, dispatch);
                    break;
                default:
                    console.log('未知命令:', command.cmd);
                    break;
            }
        });
    },
    /**
     * 接收警综平台消息
     */
    receiveBho({ dispatch }: SubscriptionAPI) {
        server.on(Bho, (command: Command) => {
            switch (command.cmd) {
                case CommandType.Platform:
                    //# 接收警综平台数据
                    saveCaseFromPlatform(command, dispatch);
                    break;
            }
        });
    },
    /**
     * Socket异常中断
     */
    socketDisconnect() {
        server.on(Error, (port: number, type: string) => {
            logger.error(`Socket异常断开, port:${port}, type:${type}`);
            let content = '服务通讯中断，请重启应用';
            switch (type) {
                case SocketType.Fetch:
                    content = '采集服务通讯中断，请重启应用';
                    break;
                case SocketType.Parse:
                    content = '解析服务通讯中断，请重启应用';
                    break;
                default:
                    content = '后台服务通讯中断，请重启应用';
                    break;
            }
            Modal.destroyAll();
            Modal.confirm({
                title: '通讯中断',
                content,
                okText: '重新启动',
                cancelText: '退出',
                icon: 'exclamation-circle',
                onOk() {
                    ipcRenderer.send('do-relaunch');
                },
                onCancel() {
                    ipcRenderer.send('do-close');
                }
            });
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
    }
}