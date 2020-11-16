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
import { TableName } from "@src/schema/db/TableName";
import BcpEntity from '@src/schema/socket/BcpEntity';
import { SendCase } from '@src/schema/platform/GuangZhou/SendCase';
import { caseStore, LocalStoreKey } from "@utils/localStore";
import Db from '@utils/db';
import logger from "@utils/log";
import { helper } from '@utils/helper';
import { send } from '@src/service/tcpServer';

/**
 * 设备状态变化
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
        //NOTE: 采集结束(成功或失败)
        //发送Windows消息
        ipcRenderer.send('show-notice', {
            message: `终端${msg.usb}「${msg.manufacturer}」手机采集结束`
        });
        //向FetchInfo组件发送消息，清理上一次缓存消息
        remote.getCurrentWebContents().send('fetch-over', msg.usb);
        //#记录日志
        dispatch({
            type: 'saveFetchLog', payload: {
                usb: msg.usb,
                state: msg.fetchState
            }
        });
        //#开始解析
        dispatch({ type: 'startParse', payload: msg.usb });
        //#采集完成清空警综平台数据
        dispatch({ type: 'dashboard/setSendCase', payload: null });
    }
    dispatch({
        type: 'updateProp', payload: {
            usb: msg.usb,
            name: 'fetchState',
            value: msg.fetchState
        }
    });
    dispatch({ type: 'updateHasFetching' });
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
    //NOTE:清除进度缓存
    remote.getCurrentWebContents().send('fetch-over', msg.usb);
    //NOTE:清理案件数据
    caseStore.remove(msg.usb!);
    dispatch({ type: 'checkWhenDeviceIn', payload: { usb: msg?.usb } });
    dispatch({ type: 'removeDevice', payload: msg.usb });
    dispatch({ type: 'updateHasFetching' });
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
 * 保存警综平台数据
 */
export function saveCaseFromPlatform({ msg }: Command<SendCase>, dispatch: Dispatch<any>) {

    if (helper.isNullOrUndefined(msg?.errcode)) {
        //* 若errcode为undefined，则说明接口访问无误
        notification.info({
            message: '警综平台消息',
            description: `接收到案件：「${msg.CaseName}」，姓名：「${msg.OwnerName}」`,
            duration: 0
        });
        console.info('接收警综平台数据：');
        console.log(msg);
        dispatch({ type: 'dashboard/setSendCase', payload: msg });
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
    logger.info(`解析详情(parse_curinfo): length=${msg?.length} 消息=${JSON.stringify(msg)}`);
    dispatch({ type: 'progressModal/setInfo', payload: msg });
}

/**
 * 解析结束
 */
export async function parseEnd({ msg }: Command<ParseEnd>, dispatch: Dispatch<any>) {

    console.log('解析结束：', JSON.stringify(msg));
    logger.info(`解析结束(ParseEnd): ${JSON.stringify(msg)}`);
    const publishPath = remote.app.getAppPath();
    try {
        let [caseData, deviceData] = await Promise.all<CCaseInfo, DeviceType>([
            new Db<CCaseInfo>(TableName.Case).findOne({ _id: msg.caseId }),
            new Db<DeviceType>(TableName.Device).findOne({ id: msg.deviceId })
        ]);
        if (msg.isparseok && caseData.generateBcp) {
            //# 解析`成功`且`是`自动生成BCP

            const bcp = new BcpEntity();
            bcp.mobilePath = deviceData.phonePath ?? '';
            bcp.attachment = caseData.attachment;
            bcp.checkUnitName = caseData.m_strCheckUnitName ?? '';
            bcp.unitNo = localStorage.getItem(LocalStoreKey.UnitCode) ?? '';
            bcp.unitName = localStorage.getItem(LocalStoreKey.UnitName) ?? '';
            bcp.dstUnitNo = localStorage.getItem(LocalStoreKey.DstUnitCode) ?? '';
            bcp.dstUnitName = localStorage.getItem(LocalStoreKey.DstUnitName) ?? '';
            bcp.officerNo = caseData.officerNo;
            bcp.officerName = caseData.officerName;
            bcp.mobileHolder = deviceData.mobileHolder ?? '';
            bcp.bcpNo = '';
            bcp.phoneNumber = '';
            bcp.credentialType = '';
            bcp.credentialNo = '';
            bcp.credentialEffectiveDate = '';
            bcp.credentialExpireDate = '';
            bcp.credentialOrg = '';
            bcp.credentialAvatar = '';
            bcp.gender = '0';
            bcp.nation = '0';
            bcp.birthday = '';
            bcp.address = '';
            bcp.securityCaseNo = caseData.securityCaseNo ?? '';
            bcp.securityCaseType = caseData.securityCaseType ?? '';
            bcp.securityCaseName = caseData.securityCaseName ?? '';
            //LEGACY:目前为保证BCP文件上传成功，将`执法办案`相关4个字段存为固定空串
            bcp.handleCaseNo = '';
            bcp.handleCaseType = '';
            bcp.handleCaseName = '';
            bcp.handleOfficerNo = '';
            // bcp.handleCaseNo = caseData.handleCaseNo ?? '';
            // bcp.handleCaseType = caseData.handleCaseType ?? '';
            // bcp.handleCaseName = caseData.handleCaseName ?? '';
            // bcp.handleOfficerNo = caseData.handleOfficerNo ?? '';
            //LEGACY ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^


            helper.writeJSONfile(path.join(deviceData.phonePath!, 'Bcp.json'), {
                ...bcp,
                attachment: bcp.attachment ? '1' : '0',
                manufacturer: localStorage.getItem('manufacturer') ?? '',
                security_software_orgcode:
                    localStorage.getItem('security_software_orgcode') ?? '',
                materials_name: localStorage.getItem('materials_name') ?? '',
                materials_model: localStorage.getItem('materials_model') ?? '',
                materials_hardware_version:
                    localStorage.getItem('materials_hardware_version') ?? '',
                materials_software_version:
                    localStorage.getItem('materials_software_version') ?? '',
                materials_serial: localStorage.getItem('materials_serial') ?? '',
                ip_address: localStorage.getItem('ip_address') ?? ''
            }).then(() => {
                logger.info(`解析结束开始自动生成BCP, 手机路径：${publishPath}`);
                const bcpExe = path.join(publishPath, '../../../tools/BcpTools/BcpGen.exe');
                const proc = execFile(bcpExe, [deviceData.phonePath!, bcp.attachment ? '1' : '0'], {
                    windowsHide: true
                });
                proc.once('close', () => {
                    //# 更新解析状态为`完成或失败`状态
                    dispatch({
                        type: 'parse/updateParseState', payload: {
                            id: msg.deviceId,
                            parseState: msg.isparseok ? ParseState.Finished : ParseState.Error
                        }
                    });
                });
                proc.once('error', () => {
                    //# 更新解析状态为`完成或失败`状态
                    dispatch({
                        type: 'parse/updateParseState', payload: {
                            id: msg.deviceId,
                            parseState: msg.isparseok ? ParseState.Finished : ParseState.Error
                        }
                    });
                });
            }).catch((err: Error) => {
                logger.error(`写入Bcp.json文件失败：${err.message}`);
            });
        }
    } catch (error) {
        //# 更新解析状态为`完成或失败`状态
        dispatch({
            type: 'parse/updateParseState', payload: {
                id: msg.deviceId,
                parseState: msg.isparseok ? ParseState.Finished : ParseState.Error
            }
        });
        logger.error(`自动生成BCP错误 @model/dashboard/Device/listener/parseEnd: ${error.message}`);
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

    const db = new Db<DeviceType>(TableName.Device);

    db.findOne({ id: msg.deviceId }).then((data: DeviceType) => {
        const [mobileName] = data.mobileName!.split('_');
        Modal.error({
            title: `「${mobileName}」导入数据失败`,
            content: msg.msg,
            okText: '确定'
        });
    }).catch((err) => {
        Modal.error({
            content: `第三方数据导入失败`,
            okText: '确定'
        });
    });
}