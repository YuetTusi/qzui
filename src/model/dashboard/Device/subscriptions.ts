import path from 'path';
import { readFileSync, mkdirSync } from 'fs';
import { ipcRenderer, IpcRendererEvent } from 'electron';
import { SubscriptionAPI } from 'dva';
import Modal from 'antd/lib/modal';
import { helper } from '@utils/helper';
import logger from '@utils/log';
import { LocalStoreKey } from '@src/utils/localStore';
import server, { send } from '@src/service/tcpServer';
import TipType from '@src/schema/socket/TipType';
import { TableName } from '@src/schema/db/TableName';
import { FetchLog } from '@src/schema/socket/FetchLog';
import CommandType, { SocketType, Command } from '@src/schema/socket/Command';
import { ParseState } from '@src/schema/socket/DeviceState';
import {
    deviceChange, deviceOut, fetchProgress, tipMsg, extraMsg, smsMsg,
    parseCurinfo, parseEnd, backDatapass, saveCaseFromPlatform, importErr,
    humanVerify, saveOrUpdateOfficerFromPlatform, traceLogin, limitResult,
    appRecFinish, fetchPercent
} from './listener';
import DeviceType from '@src/schema/socket/DeviceType';
import { DataMode } from '@src/schema/DataMode';
import PhoneSystem from '@src/schema/socket/PhoneSystem';
import CCaseInfo from '@src/schema/CCaseInfo';
import { PredictJson } from '@src/view/case/AISwitch/prop';

const cwd = process.cwd();
const isDev = process.env['NODE_ENV'] === 'development';
const { Fetch, Parse, Bho, Trace, Error } = SocketType;
const { max, useTraceLogin } = helper.readConf();

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
                        msg: { count: max }
                    });
                    break;
                case CommandType.DeviceIn:
                    console.log(`接收到设备连入:${JSON.stringify(command.msg)}`);
                    logger.info(`设备连入(DeviceIn)：${JSON.stringify(command.msg)}`);
                    let samsungTip: string | undefined;
                    let info = command.msg.phoneInfo?.find((i: { name: string, value: any }) => i.name === '系统版本');
                    if ('samsung' === command.msg.manufacturer?.toLowerCase() && Number(info?.value) >= 12) {
                        samsungTip = '请使用工具箱中「三星换机备份」进行数据采集';
                    }
                    dispatch({ type: 'checkWhenDeviceIn', payload: { usb: command.msg?.usb } });
                    dispatch({
                        type: 'setDeviceToList', payload: {
                            ...command.msg,
                            tipType: TipType.Nothing,
                            parseState: ParseState.NotParse,
                            isStopping: false,
                            extra: samsungTip
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
                case CommandType.FetchPercent:
                    console.log(`采集进度值：${JSON.stringify(command.msg)}`);
                    fetchPercent(command, dispatch);
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
                case CommandType.SmsMsg:
                    console.log(`云取验证码进度消息-${command.msg.usb}消息`);
                    logger.info(`云取验证码进度消息(SmsMsg)-USB${command.msg.usb}`);
                    smsMsg(command, dispatch);
                    break;
                case CommandType.HumanVerify:
                    console.log(`图形验证码消息-${command.msg.usb}消息`);
                    logger.info(`图形验证码消息(HumanVerify)-USB${command.msg.usb}`);
                    humanVerify(command, dispatch);
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
                case CommandType.ApkPhoneList:
                    dispatch({ type: 'apkModal/setPhone', payload: command.msg });
                    break;
                case CommandType.ApkList:
                    //# 接收apk列表消息
                    console.log(`接收到apk列表消息: ${command.msg}`);
                    dispatch({ type: 'apkModal/setApk', payload: command.msg });
                    break;
                case CommandType.ApkMsg:
                    //# 接收到apk提取消息
                    console.log(`接收到apk提取消息: ${command.msg}`);
                    dispatch({ type: 'apkModal/setMessage', payload: command.msg });
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
                        msg: { count: max }
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
                    saveOrUpdateOfficerFromPlatform(command, dispatch);
                    break;
                default:
                    console.log('未知命令:', command);
                    break;
            }
        });
    },
    /**
     * 接收Trace消息
     */
    receiveTrace({ dispatch }: SubscriptionAPI) {
        server.on(Trace, (command: Command) => {
            switch (command.cmd) {
                case CommandType.Connect:
                    logger.info(`Trace Connect`);
                    send(Trace, {
                        type: Trace,
                        cmd: CommandType.ConnectOK,
                        msg: ''
                    });
                    if (useTraceLogin) {
                        //当trace连入之后，发送登录命令
                        dispatch({ type: 'traceLogin/loadUserToLogin' });
                    }
                    break;
                case CommandType.TraceLogin:
                case CommandType.TraceLoginResult:
                    traceLogin(command, dispatch);
                    break;
                case CommandType.LimitResult:
                    limitResult(command, dispatch);
                    break;
                case CommandType.AppRecResult:
                    appRecFinish(command, dispatch);
                    break;
                default:
                    console.log('未知命令:', command);
                    break;
            }
        });
    },
    /**
     * 接收快速点验消息
     */
    receiveCheck({ dispatch }: SubscriptionAPI) {
        ipcRenderer.on('check-parse', async (event: IpcRendererEvent, args: Record<string, any>) => {

            ipcRenderer.send('show-notice', {
                message: `「${args.mobileName ?? ''}」点验结束，开始解析数据`
            });

            //NOTE:将设备数据入库
            let next = new DeviceType();
            next.mobileHolder = args.mobileHolder ?? '';
            next.phonePath = args.phonePath ?? '';
            next.caseId = args.caseId ?? '';//所属案件id
            next.mobileNo = args.mobileNo ?? '';
            next.mobileName = `${args.mobileName ?? 'DEV'}_${helper.timestamp()}`;
            next.parseState = ParseState.Parsing;
            next.mode = DataMode.Check;
            next.fetchTime = new Date();
            next.id = helper.newId();
            next.mobileNumber = '';
            next.handleOfficerNo = '';
            next.note = '';
            next.cloudAppList = [];
            next.system = PhoneSystem.Android;

            let exist: boolean = await helper.existFile(next.phonePath!);
            if (!exist) {
                //手机路径不存在，创建之
                mkdirSync(next.phonePath!, { recursive: true });
            }
            const [aiConfig, caseData]: [PredictJson, CCaseInfo, boolean] = await Promise.all([
                helper.readJSONFile(isDev ? path.join(cwd, './data/predict.json') : path.join(cwd, './resources/config/predict.json')),
                ipcRenderer.invoke('db-find-one', TableName.Case, { _id: args.caseId }),
                helper.writeJSONfile(path.join(next.phonePath!, 'Device.json'), {
                    mobileHolder: next.mobileHolder ?? '',
                    mobileNo: next.mobileNo ?? '',
                    mobileName: next.mobileName ?? '',
                    note: next.note ?? '',
                    mode: next.mode ?? DataMode.Self
                }),
            ]);

            dispatch({
                type: 'saveDeviceToCase', payload: {
                    id: next.caseId,
                    data: next
                }
            });

            //# 通知parse开始解析
            send(SocketType.Parse, {
                type: SocketType.Parse,
                cmd: CommandType.StartParse,
                msg: {
                    caseId: next.caseId,
                    deviceId: next.id,
                    phonePath: next.phonePath,
                    dataMode: DataMode.Check,
                    ruleFrom: caseData?.ruleFrom ?? 0,
                    ruleTo: caseData?.ruleTo ?? 8,
                    hasReport: true,
                    isDel: false,
                    isAi: false,
                    useAiOcr: false,
                    isPhotoAnalysis: false,
                    aiTypes: aiConfig,
                    useDefaultTemp: localStorage.getItem(LocalStoreKey.UseDefaultTemp) === '1',
                    useKeyword: localStorage.getItem(LocalStoreKey.UseKeyword) === '1',
                    useDocVerify: [
                        localStorage.getItem(LocalStoreKey.UseDocVerify) === '1',
                        localStorage.getItem(LocalStoreKey.UsePdfOcr) === '1'
                    ],
                    tokenAppList: []
                }
            });
        });
    },
    /**
     * Socket异常中断
     */
    socketDisconnect() {

        let disableWarn = false;
        const jsonPath =
            process.env['NODE_ENV'] === 'development'
                ? path.join(cwd, './data/app.json')
                : path.join(cwd, './resources/config/app.json');

        server.on(Error, (port: number, type: string) => {

            logger.error(`Socket异常断开, port:${port}, type:${type}`);
            let content = '';
            switch (type) {
                case Fetch:
                    content = '采集服务通讯中断，请重启应用';
                    break;
                case Parse:
                    content = '解析服务通讯中断，请重启应用';
                    break;
                case Bho:
                    content = '警综服务通讯中断，请重启应用';
                    break;
                case Trace:
                    content = '应用查询服务中断，请重启应用';
                    break;
                default:
                    content = '后台服务通讯中断，请重启应用';
                    break;
            }

            try {
                disableWarn = JSON.parse(readFileSync(jsonPath, { encoding: 'utf8' }))?.disableSocketDisconnectWarn;
            } catch (error) {
                disableWarn = false;
            }

            if (!disableWarn) {
                Modal.destroyAll();
                Modal.confirm({
                    title: '服务中断',
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
            }
        });
    },
    /**
     * 接收主进程日志数据入库
     */
    saveFetchLog() {
        ipcRenderer.on('save-fetch-log', async (event: IpcRendererEvent, log: FetchLog) => {
            try {
                await ipcRenderer.invoke('db-insert', TableName.FetchLog, log);
            } catch (error) {
                logger.error(`采集进度入库失败 @model/dashboard/Device/subscriptions/saveFetchLog: ${error.message}`);
            }
        });
    }
}