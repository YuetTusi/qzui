import React, { Component } from 'react';
import { connect } from 'dva';
import message from 'antd/lib/message';
import Modal from 'antd/lib/modal';
import { StoreComponent } from '@src/type/model';
import { IStoreState, ExtendPhoneInfoPara } from '@src/model/dashboard/Init/Init';
import PhoneInfo from '@src/components/PhoneInfo/PhoneInfo';
import MsgLink from '@src/components/MsgLink/MsgLink';
import { stPhoneInfoPara } from '@src/schema/stPhoneInfoPara';
import { helper } from '@utils/helper';
import StepModal from '@src/components/StepModal/StepModal';
import { steps, apk } from './steps';
import DetailModal from './components/DetailModal/DetailModal';
import CaseInputModal from './components/CaseInputModal/CaseInputModal';
import CFetchDataInfo from '@src/schema/CFetchDataInfo';
import { caseStore } from '@utils/localStore';
import { BrandName } from '@src/schema/BrandName';
import { FetchResposeUI } from '@src/schema/FetchResposeUI';
import ApkInstallModal from '@src/components/TipsModal/ApkInstallModal/ApkInstallModal';
import DegradeModal from '@src/components/TipsModal/DegradeModal/DegradeModal';
import PromptModal from '@src/components/TipsModal/PromptModal/PromptModal';
import OppoWifiConfirmModal from '@src/components/TipsModal/OppoWifiConfirmModal/OppoWifiConfirmModal';
import AppleModal from '@src/components/TipsModal/AppleModal/AppleModal';
import UsbDebugWithCloseModal from '@src/components/TipsModal/UsbDebugWithCloseModal/UsbDebugWithCloseModal';
import SamsungSmartSwitchModal from '@src/components/TipsModal/SamsungSmartSwitchModal/SamsungSmartSwitchModal';
import HisuiteFetchConfirmModal from '@src/components/TipsModal/HisuiteFetchConfirmModal/HisuiteFetchConfirmModal';
import IOSEncryptionModal from '@src/components/TipsModal/IOSEncryptionModal/IOSEncryptionModal';
import { AppDataExtractType } from '@src/schema/AppDataExtractType';
import { ConnectState } from '@src/schema/ConnectState';
import { calcRow } from './calcRow';
import { ApkType } from '@src/schema/ApkType';
import SystemType from '@src/schema/SystemType';
import './Init.less';

interface Prop extends StoreComponent {
    init: IStoreState;
}
interface State {
    //显示案件输入框
    caseModalVisible: boolean;
    //显示打开USB调试模式
    usbDebugModalVisible: boolean;
    //iPhone信任提示弹框
    appleModalVisible: boolean;
}
/**
 * 初始化连接设备
 * 对应模型：model/dashboard/Init
 */
class Init extends Component<Prop, State> {
    /**
     * 用户点采集时的默认手机品牌名
     */
    piBrand: string;
    /**
     * 手机型号
     */
    piModel: string;
    /**
     * 序列号
     */
    piSerialNumber: string;
    /**
     * 物理USB端口
     */
    piLocationID: string;
    /**
     * 采集响应码
     */
    m_ResponseUI: FetchResposeUI;
    /**
     * 设备用户列表（手机中为多用户情况）
     */
    piUserlist: number[];
    /**
     * 采集的手机数据（寄存）
     */
    phoneData: stPhoneInfoPara | null;

    constructor(props: Prop) {
        super(props);
        this.state = {
            caseModalVisible: false,
            usbDebugModalVisible: false,
            appleModalVisible: false
        };
        this.piBrand = '';
        this.piModel = '';
        this.piSerialNumber = '';
        this.piLocationID = '';
        this.m_ResponseUI = -1;
        this.piUserlist = [];
        this.phoneData = null;
    }
    componentDidMount() {
        const { dispatch } = this.props;
        dispatch({ type: 'init/queryEmptyCasePath' });
        dispatch({ type: 'init/queryEmptyCase' });
        dispatch({ type: 'init/queryEmptyOfficer' });
        dispatch({ type: 'init/queryEmptyUnit' });
    }
    /**
     * 开始取证按钮回调（采集一部手机）
     */
    collectHandle = (data: stPhoneInfoPara) => {
        this.piBrand = data.piBrand as BrandName;
        this.piModel = data.piModel as string;
        this.piSerialNumber = data.piSerialNumber as string;
        this.piLocationID = data.piLocationID as string;
        this.piUserlist = data.piUserlist!;

        const { isEmptyUnit, isEmptyOfficer, isEmptyCase, isEmptyCasePath } = this.props.init;
        message.destroy();
        if (isEmptyCasePath) {
            message.info('未设置案件存储路径，请在设置→案件存储路径中配置');
            return;
        }
        if (isEmptyCase) {
            message.info('案件信息为空，请在案件信息中添加');
            return;
        }
        if (isEmptyUnit) {
            message.info('检验单位为空，请在设置→检验单位中配置');
            return;
        }
        if (isEmptyOfficer) {
            message.info('检验员信息为空，请在设置→检验员信息中添加');
            return;
        }

        this.setState({ caseModalVisible: true });
        this.phoneData = data; //寄存手机数据，采集时会使用
    }
    /**
     * 详情按钮回调
     */
    detailHandle = (data: stPhoneInfoPara) => {
        const { dispatch } = this.props;
        this.piBrand = data.piBrand as BrandName;
        this.piModel = data.piModel as string;
        this.piSerialNumber = data.piSerialNumber as string;
        this.piLocationID = data.piLocationID as string;
        this.piUserlist = data.piUserlist!;
        dispatch({ type: 'init/subscribeDetail', payload: data });
        dispatch({ type: 'init/setDetailModalVisible', payload: true });
    }
    /**
     * 详情取消回调
     */
    detailCancelHandle = () => {
        const { dispatch } = this.props;
        dispatch({ type: 'init/unsubscribeDetail', payload: this.piSerialNumber + this.piLocationID });
        dispatch({ type: 'init/clearTipsType' });
        dispatch({ type: 'init/setDetailModalVisible', payload: false });
    }
    /**
     * 停止采集回调
     */
    stopHandle = (data: stPhoneInfoPara) => {
        const { dispatch, init } = this.props;
        Modal.confirm({
            title: '停止',
            content: '确认停止取证？',
            okText: '是',
            cancelText: '否',
            onOk() {
                let updated = init.phoneData.map<stPhoneInfoPara>(item => {
                    if (item?.piSerialNumber === data.piSerialNumber
                        && item?.piLocationID === data.piLocationID) {
                        let temp = {
                            ...item,
                            isStopping: true //停止中状态
                        };
                        return temp;
                    } else {
                        return item;
                    }
                });
                dispatch({ type: 'init/setStatus', payload: updated });
                dispatch({ type: 'init/stop', payload: data.piSerialNumber! + data.piLocationID });
            }
        });
    }
    /**
     * 采集前保存案件数据
     * @param caseData 案件数据
     */
    saveCaseHandle = (caseData: CFetchDataInfo) => {
        const { dispatch, init } = this.props;

        this.setState({ caseModalVisible: false });
        dispatch({ type: 'init/clearTipsType' });

        //NOTE:开始采集数据，派发此动作后后端会推送数据，打开步骤框
        dispatch({ type: 'init/start', payload: { caseData } });

        let updated = init.phoneData.map<stPhoneInfoPara>(item => {
            if (item?.piSerialNumber === this.phoneData!.piSerialNumber
                && item?.piLocationID === this.phoneData!.piLocationID) {
                //#再次采集前要把之间的案件数据清掉
                caseStore.remove(item.piSerialNumber! + item.piLocationID);
                caseStore.set({
                    id: item.piSerialNumber! + item.piLocationID,
                    m_strCaseName: caseData.m_strCaseName!,
                    m_strDeviceHolder: caseData.m_strDeviceHolder!,
                    m_strDeviceNumber: caseData.m_strDeviceNumber!
                    // m_strClientName: caseData.m_ClientInfo!.m_strClientName
                });
                return {
                    ...item,
                    status: ConnectState.FETCHING
                }
            } else {
                return item;
            }
        });
        dispatch({ type: 'init/setStatus', payload: updated });
    }
    /**
     * 采集输入框取消Click
     */
    cancelCaseInputHandle = () => {
        const { dispatch } = this.props;
        dispatch({ type: 'init/clearTipsType' });
        this.setState({ caseModalVisible: false });
    }
    /**
     * 打开USB调试模式提示框
     */
    usbDebugHandle = (systemType: SystemType) => {
        if (systemType === SystemType.IOS) {
            this.setState({
                appleModalVisible: true
            });
        } else {
            this.setState({
                usbDebugModalVisible: true
            });
        }
    }
    /**
     * 操作完成
     */
    operateFinished = () => {
        const { dispatch } = this.props;
        dispatch({ type: 'init/operateFinished', payload: this.piSerialNumber + this.piLocationID });
    }
    /**
     * 是否显示消息链接
     * @param phoneData 当前手机对象
     * @returns true:显示/false:关闭
     */
    isShowMsgLink = (phoneData: stPhoneInfoPara) => {
        let isShow = false;
        const { m_nFetchType, piBrand, m_ResponseUI } = phoneData;
        const isEmptyStep = steps(m_nFetchType!, piBrand! as BrandName, m_ResponseUI!).length === 0;
        if (m_ResponseUI === FetchResposeUI.FETCH_OPERATE
            || m_ResponseUI === FetchResposeUI.OPPO_FETCH_CONFIRM) {
            if (isEmptyStep) {
                //如果没有引导图，不显示消息
                isShow = false;
            } else {
                isShow = true;
            }
        }
        return isShow;
    }
    /**
     * 引导步骤框消息链接Click回调
     * @param stPhoneInfoPara对象
     */
    msgLinkHandle = (phoneData: stPhoneInfoPara) => {
        const { dispatch } = this.props;
        const { piBrand, piModel, piSerialNumber, piLocationID, piUserlist, m_nFetchType, m_ResponseUI } = phoneData;
        this.piBrand = piBrand!;
        this.piModel = piModel!;
        this.piSerialNumber = piSerialNumber!;
        this.piLocationID = piLocationID!;
        this.piUserlist = piUserlist!;
        this.m_ResponseUI = m_ResponseUI!;
        dispatch({
            type: 'init/setTipsType', payload: {
                tipsType: m_nFetchType,
                piBrand,
                piSerialNumber,
                piLocationID,
                m_ResponseUI
            }
        });
    }
    /**
     * 是否显示安装APK提示链接
     * @param phoneData 当前手机对象
     * @returns true:显示/false:关闭
     */
    isShowManualApkLink = (phoneData: stPhoneInfoPara) => {
        const { m_ResponseUI } = phoneData;
        return m_ResponseUI === FetchResposeUI.MANUAL_INSTALL;
    }
    /**
     * 提示安装APK消息链接Click回调
     */
    manualApkLinkHandle = (phoneData: stPhoneInfoPara) => {
        const { dispatch } = this.props;
        const { piSerialNumber, piLocationID } = phoneData;
        dispatch({
            type: 'init/setManualApk', payload: {
                manualApkPhoneId: piSerialNumber! + piLocationID,
                //LEGACY: 此处的APK类型先写死，以后扩展APK类型需要从后台的stPhoneInfoPara中传过来
                manualApkType: ApkType.AGENT_APK
            }
        });
    }
    /**
     * 是否显示步骤提示框
     * @param isEmpty 步骤数据是否为空
     */
    isShowStepModal = (isEmpty: boolean): boolean => {
        const { tipsType, detailModalVisible } = this.props.init;
        const { caseModalVisible } = this.state;
        if (tipsType === null) {
            return false;
        } else if (isEmpty) {
            return false;
        } else if (caseModalVisible || detailModalVisible) {
            //NOTE:若采集输入框或详情框打开着，不显示
            return false;
        } else {
            return true;
        }
    }
    /**
     * 是否显示打开USB调试提示框
     */
    isShowUsbDebugModal = (): boolean => {
        const { fetchResponseCode } = this.props.init;
        if (fetchResponseCode === FetchResposeUI.OPEN_USB_DEBUG_MOD
            || this.state.usbDebugModalVisible) {
            return true;
        } else {
            return false;
        }
    }
    /**
     * 关闭USB调试模式提示框
     */
    cancelUsbDebugHandle = () => {
        const { dispatch } = this.props;
        dispatch({
            type: 'init/setFetchResponseCode', payload: {
                fetchResponseCode: FetchResposeUI.USB_DEBUG_MOD_CLOSE,
                fetchResponseID: null
            }
        });
        this.setState({
            usbDebugModalVisible: false
        });
    }
    /**
     * 关闭安装APK弹框
     */
    cancelApkInstallModal = () => {
        const { dispatch } = this.props;
        dispatch({
            type: 'init/setFetchResponseCode', payload: {
                fetchResponseCode: FetchResposeUI.INSTALL_TZSAFE_CLOSE,
                fetchResponseID: null
            }
        });
    }
    /**
     * 关闭降级备份弹框
     */
    cancelDegradeModal = () => {
        const { dispatch } = this.props;
        dispatch({
            type: 'init/setFetchResponseCode', payload: {
                fetchResponseCode: FetchResposeUI.DOWNGRADE_BACKUP_CLOSE,
                fetchResponseID: null
            }
        });
    }
    /**
     * 关闭数据提取弹框
     */
    cancelPromptModal = () => {
        const { dispatch } = this.props;
        dispatch({
            type: 'init/setFetchResponseCode', payload: {
                fetchResponseCode: FetchResposeUI.TZSAFE_PERMISSION_CLOSE,
                fetchResponseID: null
            }
        });
    }
    /**
     * 关闭三星助手弹框
     */
    cancelSamsungSmartSwitchModal = () => {
        const { dispatch } = this.props;
        dispatch({
            type: 'init/setFetchResponseCode', payload: {
                fetchResponseCode: FetchResposeUI.SAMSUNG_BACKUP_PERMISSION_CLOSE,
                fetchResponseID: null
            }
        });
    }
    /**
     * 关闭华为Hisuite助手确认弹框
     */
    cancelHisuiteFetchConfirmModal = () => {
        const { dispatch } = this.props;
        dispatch({
            type: 'init/setFetchResponseCode', payload: {
                fetchResponseCode: -1,
                fetchResponseID: null
            }
        });
    }
    /**
     * OPPO采集确认Yes回调
     * #用户点`是`后直接派发operateFinished
     */
    oppoWifiConfirmOkHandle = () => {
        const { dispatch, init } = this.props;
        dispatch({ type: 'init/operateFinished', payload: init.fetchResponseID });
        dispatch({
            type: 'init/setFetchResponseCode', payload: {
                fetchResponseCode: -1,
                fetchResponseID: null
            }
        });
    }
    /**
     * OPPO采集确认No回调
     */
    oppoWifiConfirmCancelHandle = () => {
        const { dispatch } = this.props;
        dispatch({
            type: 'init/setFetchResponseCode', payload: {
                fetchResponseCode: -1,
                fetchResponseID: null
            }
        });
    }
    /**
     * 步骤框用户完成
     */
    stepFinishHandle = () => {
        const { dispatch, init } = this.props;
        // this.phoneData?.m_nFetchType
        if (init.piBrand.toLowerCase() === BrandName.OPPO && init.tipsType === AppDataExtractType.BACKUP_WIFI) {
            //NOTE:OPPO手机WiFi采集不必调OperateFinished接口
            console.log(`品牌:${init.piBrand}, 采集方式:${init.tipsType}`);
        } else {
            this.operateFinished();
        }
        dispatch({ type: 'init/clearTipsType' });//关闭步骤框
        dispatch({
            type: 'init/setResponseUI', payload: {
                id: this.piSerialNumber + this.piLocationID,
                m_ResponseUI: -1
            }
        });
    }
    /**
     * 步骤框用户取消
     */
    stepCancelHandle = () => {
        const { dispatch } = this.props;
        dispatch({ type: 'init/clearTipsType' });
    }
    /**
     * 手动安装APK操作完成Handle
     */
    manualApkFinishHandle = () => {
        const { dispatch } = this.props;
        const { manualApkPhoneId } = this.props.init;
        dispatch({ type: 'init/clearManualApk' });
        dispatch({ type: 'init/operateFinished', payload: manualApkPhoneId });
        dispatch({
            type: 'init/setResponseUI', payload: {
                id: manualApkPhoneId,
                m_ResponseUI: -1
            }
        });
    }
    /**
     * 手动安装APK操作取消Handle
     */
    manualApkCancelHandle = () => {
        const { dispatch } = this.props;
        dispatch({ type: 'init/clearManualApk' });
    }
    /**
     * iOS数据加密警告提示确认Handle
     */
    iOSEncryptionConfirmHandle = () => {
        const { dispatch } = this.props;
        dispatch({ type: 'init/setIOSEncryptionAlert', payload: false });
    }
    /**
     * 渲染手机信息组件
     */
    renderPhoneInfo(phoneData: ExtendPhoneInfoPara[]): JSX.Element[] {
        if (helper.isNullOrUndefined(phoneData)) {
            return [];
        }
        let _this = this;
        let dom: Array<JSX.Element> = [];
        for (let i = 0; i < helper.getConfig().max; i++) {
            (function (index: number) {
                if (helper.isNullOrUndefined(phoneData[index])) {
                    dom.push(<div className="col" key={helper.getKey()}>
                        <div className="cell">
                            <div className="no">
                                <div>
                                    <i className="terminal" />
                                    <span>{`终端${index + 1}`}</span>
                                </div>
                            </div>
                            <div className="place">
                                <PhoneInfo
                                    index={index}
                                    status={ConnectState.WAITING}
                                    collectHandle={_this.collectHandle}
                                    detailHandle={_this.detailHandle}
                                    stopHandle={_this.stopHandle} />
                            </div>
                        </div>
                    </div>);
                } else {
                    dom.push(<div className="col" key={helper.getKey()}>
                        <div className="cell">
                            <div className="no">
                                <div>
                                    <i className="terminal" />
                                    <span>{`终端${index + 1}`}</span>
                                </div>
                                <MsgLink
                                    isShow={_this.isShowMsgLink(phoneData[index])}
                                    clickHandle={() => _this.msgLinkHandle(phoneData[index])}>
                                    消息
                                </MsgLink>
                                <MsgLink
                                    isShow={_this.isShowManualApkLink(phoneData[index])}
                                    clickHandle={() => _this.manualApkLinkHandle(phoneData[index])}>
                                    安装APK
                                </MsgLink>
                            </div>
                            <div className="place">
                                <PhoneInfo
                                    index={index}
                                    status={phoneData[index].status}
                                    collectHandle={_this.collectHandle}
                                    detailHandle={_this.detailHandle}
                                    usbDebugHandle={_this.usbDebugHandle}
                                    stopHandle={_this.stopHandle}
                                    {...phoneData[index]} />
                            </div>
                        </div>
                    </div>);
                }
            })(i);
        }
        return dom;
    }
    render(): JSX.Element {
        const { init } = this.props;
        const stepData = steps(init.tipsType, init.piBrand, init.m_ResponseUI);
        const cols = this.renderPhoneInfo(init.phoneData);
        return <div className="init">
            <div className={helper.getConfig().max <= 2 ? 'panel only2' : 'panel'}>
                {calcRow(cols)}
            </div>
            <CaseInputModal
                visible={this.state.caseModalVisible}
                piBrand={this.piBrand}
                piModel={this.piModel}
                piSerialNumber={this.piSerialNumber}
                piLocationID={this.piLocationID}
                piUserlist={this.piUserlist}
                saveHandle={this.saveCaseHandle}
                cancelHandle={() => this.cancelCaseInputHandle()} />

            {/* 取证详情弹框 */}
            <DetailModal
                visible={init.detailModalVisible}
                message={init.detailMessage!}
                cancelHandle={() => this.detailCancelHandle()} />

            {/* 引导用户操作弹框 */}
            <StepModal
                visible={this.isShowStepModal(stepData.length === 0)}
                steps={stepData}
                width={1060}
                finishHandle={() => this.stepFinishHandle()}
                cancelHandle={() => this.stepCancelHandle()} />

            {/* 提示用户手动安装APK弹框 */}
            <StepModal
                visible={init.manualApkPhoneId !== null}
                steps={apk(init.manualApkType)}
                finishHandle={this.manualApkFinishHandle}
                cancelHandle={this.manualApkCancelHandle}
                title="请按提示手动安装APK"
                width={800} />

            {/* iOS数据加密提示 */}
            <IOSEncryptionModal
                visible={init.iOSEncryptionAlert}
                okHandle={this.iOSEncryptionConfirmHandle} />

            {/* APK安装提示 */}
            <ApkInstallModal
                visible={init.fetchResponseCode === FetchResposeUI.INSTALL_TZSAFE_CONFIRM}
                okHandle={this.cancelApkInstallModal} />
            {/* 降级备份提示 */}
            <DegradeModal
                visible={init.fetchResponseCode === FetchResposeUI.DOWNGRADE_BACKUP}
                okHandle={this.cancelDegradeModal} />
            {/* 数据提取提示 */}
            <PromptModal
                visible={init.fetchResponseCode === FetchResposeUI.TZSAFE_PERMISSION_CONFIRM}
                okHandle={this.cancelPromptModal} />
            {/* 三星助手提示 */}
            <SamsungSmartSwitchModal
                visible={init.fetchResponseCode === FetchResposeUI.SAMSUNG_BACKUP_PERMISSION_CONFIRM}
                okHandle={this.cancelSamsungSmartSwitchModal} />
            {/* OPPO WiFi采集提示 */}
            <OppoWifiConfirmModal
                visible={init.fetchResponseCode === FetchResposeUI.OPPO_FETCH_CONFIRM}
                okHandle={() => this.oppoWifiConfirmOkHandle()}
                cancelHandle={() => this.oppoWifiConfirmCancelHandle()} />
            <AppleModal visible={this.state.appleModalVisible} okHandle={() => this.setState({ appleModalVisible: false })} />
            {/* 打开USB调试模式提示 */}
            <UsbDebugWithCloseModal
                visible={this.isShowUsbDebugModal()}
                okHandle={this.cancelUsbDebugHandle} />
            {/* Hisuite连接确认提示 */}
            <HisuiteFetchConfirmModal
                visible={init.fetchResponseCode === FetchResposeUI.HISUITE_FETCH_CONFIRM}
                okHandle={this.cancelHisuiteFetchConfirmModal} />
        </div>;
    }
}

export default connect((state: any) => ({ 'init': state.init }))(Init);