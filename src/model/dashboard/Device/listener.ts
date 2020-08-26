import path from 'path';
import { execFile } from 'child_process';
import { Dispatch } from "redux";
import { ipcRenderer, remote } from "electron";
import { Command } from "@src/schema/socket/Command";
import DeviceType from "@src/schema/socket/DeviceType";
import { FetchState, ParseState } from "@src/schema/socket/DeviceState";
import { FetchProgress } from "@src/schema/socket/FetchRecord";
import GuideImage from "@src/schema/socket/GuideImage";
import TipType, { ReturnButton } from "@src/schema/socket/TipType";
import ParseDetail from "@src/schema/socket/ParseDetail";
import { ParseEnd } from "@src/schema/socket/ParseLog";
import { CCaseInfo } from "@src/schema/CCaseInfo";
import { TableName } from "@src/schema/db/TableName";
import localStore, { caseStore, LocalStoreKey } from "@utils/localStore";
import Db from '@utils/db';
import logger from "@utils/log";

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
    //NOTE:清除进度缓存
    remote.getCurrentWebContents().send('fetch-over', msg.usb);
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
            const params: any[] = [
                deviceData.phonePath, //手机完整路径
                caseData.attachment ? '1' : '0', //有无附件
                caseData.m_strCheckUnitName,//检验单位名称
                localStorage.getItem(LocalStoreKey.UnitCode) || undefined, //采集单位编号
                localStorage.getItem(LocalStoreKey.UnitName) || undefined,  //采集单位名称
                localStorage.getItem(LocalStoreKey.DstUnitCode) || undefined, //目的检验单位编号
                localStorage.getItem(LocalStoreKey.DstUnitName) || undefined,   //目的检验单位名称
                caseData.officerNo,//采集人员编号(6位警号)
                caseData.officerName,//采集人员姓名
                deviceData.mobileHolder,//持有人
                undefined, //检材编号
                undefined, //手机号
                undefined, //证件类型
                undefined,//证件编号
                undefined,//证件生效日期
                undefined,//证件失效日期
                undefined,//证件签发机关
                undefined,//认证头像
                '0',//性别
                '0',//民族
                undefined,//出生日期
                undefined,//住址
                caseData.securityCaseNo,
                caseData.securityCaseType,
                caseData.securityCaseName,
                caseData.handleCaseNo,
                caseData.handleCaseType,
                caseData.handleCaseName,
                caseData.handleOfficerNo,
                localStorage.getItem('manufacturer') || undefined, //设备制造商
                localStorage.getItem('security_software_orgcode') || undefined, //组织机构代码
                localStorage.getItem('materials_name') || undefined,//设备名称
                localStorage.getItem('materials_model') || undefined,//设备型号
                localStorage.getItem('materials_hardware_version') || undefined, //硬件版本
                localStorage.getItem('materials_software_version') || undefined, //软件版本
                localStorage.getItem('materials_serial') || undefined, //设备序列号
                localStorage.getItem('ip_address') || undefined //采集点IP
            ];
            logger.info(`解析结束开始自动生成BCP, 参数：${params}`);
            console.log(`解析结束开始自动生成BCP, 参数：${params}`);
            const bcpExe = path.join(publishPath, '../../../tools/BcpTools/BcpGen.exe');
            const process = execFile(bcpExe, params, {
                windowsHide: true
            });
        }
    } catch (error) {
        logger.error(`自动生成BCP错误 @model/dashboard/Device/listener/parseEnd: ${error.message}`);
    }

    //# 更新解析状态为`完成或失败`状态
    dispatch({
        type: 'parse/updateParseState', payload: {
            id: msg.deviceId,
            caseId: msg.caseId,
            parseState: msg.isparseok ? ParseState.Finished : ParseState.Error
        }
    });
    //# 保存日志
    dispatch({ type: 'saveParseLog', payload: msg });
}