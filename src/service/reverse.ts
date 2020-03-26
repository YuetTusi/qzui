import { ipcRenderer } from "electron";
import { Dispatch } from "redux";
import { stPhoneInfoPara } from "@src/schema/stPhoneInfoPara";
import { PhoneInfoStatus } from "@src/components/PhoneInfo/PhoneInfoStatus";
import FetchResposeUI from "@src/schema/FetchResposeUI";
import { DetailMessage } from "@src/type/DetailMessage";
import { UIRetOneInfo } from "@src/schema/UIRetOneInfo";
import { DelType } from "@src/schema/DelType";
import CFetchLog from "@src/schema/CFetchLog";
import groupBy from 'lodash/groupBy';
import message from 'antd/lib/message';
import Modal from 'antd/lib/modal';
import logger from "@src/utils/log";
import Db from '@utils/Db';

/**
 * 采集反向推送方法
 * @param dispatch 派发方法
 */
function fetchReverseMethods(dispatch: Dispatch<any>) {
    return [
        /**
         * 连接设备的反馈，当插拔USB时后台会推送数据
         * @param args stPhoneInfoPara数组
         */
        function receiveUsb(args: stPhoneInfoPara[]): void {
            if (args && args.length > 0) {
                dispatch({ type: 'init/setPhoneData', payload: args });
            } else {
                //USB已断开
                dispatch({ type: 'init/clearPhoneData' });
            }
        },
        /**
         * 采集反馈数据
         * @param {stPhoneInfoPara} data 后端反馈的结构体
         */
        function collectBack(phoneInfo: stPhoneInfoPara): void {
            //通知详情框采集完成
            ipcRenderer.send('collecting-detail', { ...phoneInfo, isFinished: true });
            ipcRenderer.send('show-notice', { title: '取证完成', message: `「${phoneInfo.piBrand}」手机数据已取证完成` });

            const db = new Db<CFetchLog>('FetchLog');
            db.insert(phoneInfo.m_log!); //写入用户日志
            console.log('collectBack:');
            console.log(phoneInfo.m_log);

            //将此手机状态置为"取证完成"
            dispatch({
                type: 'init/setStatus', payload: {
                    ...phoneInfo,
                    status: PhoneInfoStatus.FETCHEND,
                    isStopping: false
                }
            });
        },
        /**
         * 用户提示反馈数据
         * @param phoneInfo 手机采集数据
         * @param type 提示类型枚举
         */
        function tipsBack(phoneInfo: stPhoneInfoPara): void {
            ipcRenderer.send('show-notice', {
                title: '消息',
                message: `请点击「消息」按步骤对${phoneInfo.piBrand}设备进行操作`
            });
            dispatch({ type: 'init/queryPhoneList' });
            dispatch({
                type: 'init/setTipsType', payload: {
                    tipsType: phoneInfo.m_nFetchType,
                    piSerialNumber: phoneInfo.piSerialNumber,
                    piLocationID: phoneInfo.piLocationID,
                    piBrand: phoneInfo.piBrand
                }
            });
        },
        /**
         * 用户确认反馈
         * @param id 序列号+USB物理ID
         * @param code 采集响应码
         */
        function userConfirm(id: string, code: FetchResposeUI): void {
            dispatch({
                type: 'init/setFetchResponseCode', payload: {
                    fetchResponseCode: code,
                    fetchResponseID: id
                }
            });
        },
        /**
         * 采集详情实时消息
         * @param message 采集消息对象
         */
        function collectDetail(message: DetailMessage) {
            dispatch({ type: 'init/setDetailMessage', payload: message });
        },
        /**
         * 案件删除后的推送
         * @param casePath 案件路径
         * @param success 是否成功
         * @param delType 删除类型
         */
        function DeleteCaseFinish(casePath: string, delType: DelType, success: boolean) {
            ipcRenderer.send('show-notification', {
                type: success ? 'success' : 'error',
                message: success ? '删除成功' : '删除失败'
            });
            message.destroy();
            if (delType === DelType.DEL_PHONE) {
                //删除的是手机，需要截取路径到案件
                casePath = casePath.substring(0, casePath.lastIndexOf('\\'));
            }
            dispatch({ type: 'caseData/setLoading', payload: false });
            dispatch({ type: 'caseData/fetchCaseData' });
            dispatch({ type: 'innerPhoneTable/fetchPhoneDataByCase', payload: casePath });
        },
        /**
         * 服务端磁盘空间检测
         */
        function DiskFull() {
            Modal.error({
                title: '磁盘已满',
                content: '磁盘空间已满，请清理磁盘数据',
                okText: '确定'
            });
        }
    ];
}

/**
 * 解析反向推送方法
 * @param dispatch 派发方法
 */
function parseReverseMethods(dispatch: Dispatch<any>) {
    return [
        function parsingData(data: UIRetOneInfo[]) {
            try {
                dispatch({ type: 'display/setSource', payload: data });
                //按案件名分组
                const grp = groupBy<UIRetOneInfo>(data, (item) => item.strCase_);
                let caseList = [];
                for (let [k, v] of Object.entries<UIRetOneInfo[]>(grp as any)) {
                    if (v[0].strPhone_) {
                        caseList.push({
                            caseName: k,
                            phone: v
                        });
                    } else {
                        caseList.push({
                            caseName: k,
                            phone: []
                        });
                    }
                }
                dispatch({ type: 'display/setParsingListData', payload: caseList });
            } catch (error) {
                logger.error({ message: `解析列表查询失败 @service/reverse/parsingData: ${error.stack}` });
                console.log(`解析列表查询失败 @service/reverse/parsingData:${error.message}`);
            }
        }
    ];
}

export { fetchReverseMethods, parseReverseMethods };