import path from 'path';
import { execFile } from 'child_process';
import { Dispatch } from "redux";
import { ipcRenderer, remote } from "electron";
import Modal from 'antd/lib/modal';
import notification from 'antd/lib/notification';
import { inputPassword } from '@src/components/feedback';
import { DeviceParam } from '@src/components/feedback/InputPassword/componentTypes';
import CommandType, { Command, SocketType } from "@src/schema/socket/Command";
import DeviceType from "@src/schema/socket/DeviceType";
import { FetchState, ParseState } from "@src/schema/socket/DeviceState";
import { FetchProgress } from "@src/schema/socket/FetchRecord";
import GuideImage from "@src/schema/socket/GuideImage";
import TipType, { ReturnButton } from "@src/schema/socket/TipType";
import ParseDetail from "@src/schema/socket/ParseDetail";
import { ParseEnd } from "@src/schema/socket/ParseLog";
import { CCaseInfo } from "@src/schema/CCaseInfo";
import { Officer } from '@src/schema/Officer';
import { TableName } from "@src/schema/db/TableName";
import { SendCase } from '@src/schema/platform/GuangZhou/SendCase';
import { caseStore } from "@utils/localStore";
import logger from "@utils/log";
import { helper } from '@utils/helper';
import { send } from '@src/service/tcpServer';
import { DbInstance } from '@src/type/model';
import { CaptchaMsg } from '@src/components/guide/CloudCodeModal/CloudCodeModalType';
import { DataMode } from '@src/schema/DataMode';
import { CloudAppMessages } from '@src/schema/socket/CloudAppMessages';

const getDb = remote.getGlobal('getDb');
const appPath = remote.app.getAppPath();

/**
 * 设备状态变化（DeviceChange）通讯参数
 */
interface DeviceChangeParam {
    /**
     * USB序号
     */
    usb: number,
    /**
     * 采集状态
     */
    fetchState: FetchState,
    /**
     * 设备厂商
     */
    manufacturer: string,
    /**
     * 模式
     */
    mode: DataMode,
    /**
     * 云取应用列表
     */
    cloudAppList: CloudAppMessages[]
}


/**
 * 设备状态变化
 */
export function deviceChange({ msg }: Command<DeviceChangeParam>, dispatch: Dispatch<any>) {

    if (msg.fetchState !== FetchState.Fetching) {
        //NOTE:停止计时
        ipcRenderer.send('time', msg.usb - 1, false);
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
        //NOTE: 采集结束(成功或失败)

        if (msg.mode === DataMode.ServerCloud) {
            //云取
            //# 将云取成功状态设置到cloudCodeModal模型中，会根据状态分类着色，并写入日志
            dispatch({ type: 'cloudCodeModal/setState', payload: { usb: msg.usb, apps: msg.cloudAppList } });
            dispatch({ type: 'cloudCodeModal/saveCloudLog', payload: { usb: msg.usb } });
        } else {
            //非云取
            //向FetchInfo组件发送消息，清理上一次缓存消息
            remote.getCurrentWebContents().send('fetch-over', msg.usb);
            //#记录日志
            dispatch({
                type: 'saveFetchLog', payload: {
                    usb: msg.usb,
                    state: msg.fetchState
                }
            });
        }
        //发送Windows消息
        ipcRenderer.send('show-notice', {
            message: `终端 #${msg.usb}「${msg.manufacturer}」采集结束`
        });
        //#开始解析
        dispatch({ type: 'startParse', payload: msg.usb });
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
    console.log(`接收到设备断开:USB#${msg.usb}`);
    //NOTE:清除采集日志
    ipcRenderer.send('progress-clear', msg.usb);
    //NOTE:停止计时
    ipcRenderer.send('time', msg.usb! - 1, false);
    //NOTE:清除进度缓存
    remote.getCurrentWebContents().send('fetch-over', msg.usb);
    //NOTE:清理案件数据
    caseStore.remove(msg.usb!);
    dispatch({ type: 'checkWhenDeviceIn', payload: { usb: msg.usb } });
    dispatch({ type: 'removeDevice', payload: msg.usb });
    dispatch({ type: 'cloudCodeModal/clearApps', payload: msg.usb });
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
export function tipMsg({ msg }: Command<{
    usb: number,
    type: TipType,
    title: string,
    content: string,
    image: GuideImage,
    yesButton: ReturnButton,
    noButton: ReturnButton
}>,
    dispatch: Dispatch<any>) {
    ipcRenderer.send('show-notification', {
        message: `「终端${msg.usb}」有新消息`
    });

    dispatch({
        type: 'setTip', payload: {
            usb: msg.usb,
            tipType: msg.type,
            tipTitle: msg.title,
            tipContent: msg.content,
            tipImage: msg.image,
            tipYesButton: msg.yesButton,
            tipNoButton: msg.noButton
        }
    });
}

/**
 * 接收短信云取证验证码详情（单条）
 */
export function smsMsg({ msg }: Command<{
    usb: number,
    appId: string,
    disabled: boolean,
    message: CaptchaMsg
}>, dispatch: Dispatch<any>) {
    const { usb, appId, disabled } = msg;
    dispatch({
        type: 'cloudCodeModal/appendMessage', payload: {
            usb,
            disabled,
            m_strID: appId,
            message: { ...msg.message, actionTime: new Date() }
        }
    });
}


/**
 * 保存警综平台数据
 */
export function saveCaseFromPlatform({ msg }: Command<SendCase>, dispatch: Dispatch<any>) {

    if (helper.isNullOrUndefined(msg.errcode)) {
        //* 若errcode为undefined，则说明接口访问无误
        notification.close('platformNotice');
        notification.info({
            key: 'platformNotice',
            message: '警综平台消息',
            description: `接收到案件：「${msg.CaseName}」，姓名：「${msg.OwnerName}」`,
            duration: 30
        });
        logger.info(`接收警综平台数据 @model/dashboard/Device/listener/saveCaseFromPlatform：${JSON.stringify(msg)}`);
        const officer: Officer = {
            name: msg.OfficerName ?? '',
            no: msg.OfficerID ?? ''
        };
        dispatch({ type: 'dashboard/setSendCase', payload: msg });
        dispatch({ type: 'dashboard/setSendOfficer', payload: officer });
    } else {
        notification.error({
            message: '警综数据错误',
            description: `数据接收错误，请在警综平台重新发起推送`
        });
        dispatch({ type: 'dashboard/setSendCase', payload: null });
    }
}

/**
 * 接收手机多用户/隐私空间消息
 */
export function extraMsg({ msg }: Command<{ usb: number, content: string }>, dispatch: Dispatch<any>) {
    dispatch({ type: 'updateProp', payload: { usb: msg.usb, name: 'extra', value: msg.content } });
}

/**
 * 解析详情
 */
export function parseCurinfo({ msg }: Command<ParseDetail[]>, dispatch: Dispatch<any>) {
    dispatch({ type: 'progressModal/setInfo', payload: msg });
}

/**
 * 解析结束
 */
export async function parseEnd({ msg }: Command<ParseEnd>, dispatch: Dispatch<any>) {

    console.log('解析结束：', JSON.stringify(msg));
    logger.info(`解析结束(ParseEnd): ${JSON.stringify(msg)}`);
    try {
        let [caseData, deviceData] = await Promise.all<CCaseInfo, DeviceType>([
            getDb(TableName.Case).findOne({ _id: msg.caseId }),
            getDb(TableName.Device).findOne({ id: msg.deviceId })
        ]);
        if (msg.isparseok && caseData.generateBcp) {
            //# 解析`成功`且`是`自动生成BCP
            logger.info(`解析结束开始自动生成BCP, 手机路径：${deviceData.phonePath}`);
            const bcpExe = path.join(appPath, '../../../tools/BcpTools/BcpGen.exe');
            const proc = execFile(bcpExe, [deviceData.phonePath!, caseData.attachment ? '1' : '0'], {
                windowsHide: true,
                cwd: path.join(appPath, '../../../tools/BcpTools')
            });
            proc.once('close', () => {
                dispatch({ type: "parse/fetchCaseData", payload: { current: 1 } });
            });
            proc.once('error', (err) => {
                logger.error(`生成BCP错误 @model/dashboard/Device/listener/parseEnd: ${err.message}`);
            });
        }
        if (!msg.isparseok && !helper.isNullOrUndefined(msg?.errmsg)) {
            Modal.error({
                title: '解析错误',
                content: msg.errmsg,
                okText: '确定'
            });
        }
    } catch (error) {
        logger.error(`自动生成BCP错误 @model/dashboard/Device/listener/parseEnd: ${error.message}`);
    } finally {
        //# 更新解析状态为`完成或失败`状态
        dispatch({
            type: 'parse/updateParseState', payload: {
                id: msg.deviceId,
                parseState: msg.isparseok ? ParseState.Finished : ParseState.Error
            }
        });
    }

    //# 保存日志
    dispatch({ type: 'saveParseLog', payload: msg });
}

/**
 * 提示用户输入密码
 */
export function backDatapass({ msg }: Command<DeviceParam>, dispatch: Dispatch<any>) {

    inputPassword(msg, (params, forget, password) => {

        send(SocketType.Parse, {
            type: SocketType.Parse,
            cmd: CommandType.ConfirmDatapass,
            msg: {
                forget,
                password,
                ...params
            }
        });
    });
}

/**
 * 导入第三方数据失败
 * @param param0 
 * @param dispatch 
 */
export function importErr({ msg }: Command<DeviceParam>, dispatch: Dispatch<any>) {

    const db: DbInstance<DeviceType> = getDb(TableName.Device);

    db.findOne({ id: msg.deviceId }).then((data: DeviceType) => {
        const [mobileName] = data.mobileName!.split('_');
        Modal.error({
            title: `「${mobileName}」导入数据失败`,
            content: msg.msg,
            okText: '确定'
        });
    }).catch((err: Error) => {
        Modal.error({
            content: `第三方数据导入失败`,
            okText: '确定'
        });
    });
}