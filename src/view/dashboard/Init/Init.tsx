import React, { Component } from 'react';
import moment from 'moment';
import { connect } from 'dva';
import { ipcRenderer } from 'electron';
import { IObject, StoreComponent } from '@src/type/model';
import { IStoreState } from '@src/model/dashboard/Init/Init';
import PhoneInfo from '@src/components/PhoneInfo/PhoneInfo';
import MsgLink from '@src/components/MsgLink/MsgLink';
import { stPhoneInfoPara } from '@src/schema/stPhoneInfoPara';
import { helper } from '@utils/helper';
import { PhoneInfoStatus } from '@src/components/PhoneInfo/PhoneInfoStatus';
import StepModal from '@src/components/StepModal/StepModal';
import { steps } from './steps';
import DetailModal from './components/DetailModal/DetailModal';
import CaseInputModal from './components/CaseInputModal/CaseInputModal';
import Icon from 'antd/lib/icon';
import message from 'antd/lib/message';
import Modal from 'antd/lib/modal';
import CFetchDataInfo from '@src/schema/CFetchDataInfo';
import { ConnectSate } from '@src/schema/ConnectState';
import { tipsStore } from '@utils/sessionStore';
import { BrandName } from '@src/schema/BrandName';
import { FetchResposeUI } from '@src/schema/FetchResposeUI';
import ApkInstallModal from '@src/components/TipsModal/ApkInstallModal/ApkInstallModal';
import DegradeModal from '@src/components/TipsModal/DegradeModal/DegradeModal';
import PromptModal from '@src/components/TipsModal/PromptModal/PromptModal';
import UsbDebugWithCloseModal from '@src/components/TipsModal/UsbDebugWithCloseModal/UsbDebugWithCloseModal';
import SamsungSmartSwitchModal from '@src/components/TipsModal/SamsungSmartSwitchModal/SamsungSmartSwitchModal';
import { max } from '@src/config/ui.config.json';
import './Init.less';

interface IProp extends StoreComponent {
    init: IStoreState;
}
interface IState {
    //显示案件输入框
    caseModalVisible: boolean;
    //显示采集详情框
    detailModalVisible: boolean;
    //显示打开USB调试模式
    usbDebugModalVisible: boolean;
}
/**
 * 初始化连接设备
 * 对应模型：model/dashboard/Init
 */
class Init extends Component<IProp, IState> {
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
     * 当前采集手机的案件名称
     */
    m_strCaseName: string;
    /**
     * 手机持有人
     */
    m_strDeviceHolder: string;
    /**
     * 检材编号
     */
    m_strDeviceNumber: string;
    /**
     * 送检单位
     */
    m_strClientName: string;
    /**
     * 采集的手机数据（寄存）
     */
    phoneData: stPhoneInfoPara | null;

    constructor(props: IProp) {
        super(props);
        this.state = {
            caseModalVisible: false,
            detailModalVisible: false,
            usbDebugModalVisible: false
        };
        this.piBrand = '';
        this.piModel = '';
        this.piSerialNumber = '';
        this.piLocationID = '';
        this.m_strCaseName = '';
        this.m_strDeviceHolder = '';
        this.m_strDeviceNumber = '';
        this.m_strClientName = '';
        this.phoneData = null;
    }
    componentDidMount() {
        const { dispatch } = this.props;
        dispatch({ type: 'init/queryEmptyCase' });
        dispatch({ type: 'init/queryEmptyOfficer' });
        dispatch({ type: 'init/queryEmptyUnit' });
    }
    /**
     * NOTE:渲染优化，调试时请注释掉
     */
    shouldComponentUpdate(nextProps: IProp, nextState: IState) {
        const { phoneData } = this.props.init;
        const { phoneData: nextPhoneData } = nextProps.init;

        if (phoneData.filter((i: any) => i !== undefined).length !== nextPhoneData.filter((i: any) => i !== undefined).length) {
            return true;
        } else if (this.props.init.tipsType !== nextProps.init.tipsType) {
            return true;
        } else if (this.props.init.fetchResponseCode !== nextProps.init.fetchResponseCode) {
            return true;
        } else if (this.state.usbDebugModalVisible !== nextState.usbDebugModalVisible) {
            return true;
        } else if (this.state.caseModalVisible !== nextState.caseModalVisible
            || this.state.detailModalVisible !== nextState.detailModalVisible) {
            return true;
        } else if (this.isChangeStatus(phoneData, nextPhoneData)) {
            return true;
        } else {
            return false;
        }
    }
    /**
     * 验证新旧手机数据中的状态(status)是否变化
     * @param phoneData 原手机数据列表
     * @param nextPhoneData 新手机数据列表
     * @returns 若手机列表中手机对应的状态不一致，返回true
     */
    isChangeStatus(phoneData: stPhoneInfoPara[], nextPhoneData: stPhoneInfoPara[]) {
        phoneData = phoneData.filter((i: stPhoneInfoPara) => !helper.isNullOrUndefined(i));
        nextPhoneData = nextPhoneData.filter((i: stPhoneInfoPara) => !helper.isNullOrUndefined(i));
        let isChanged = false;
        for (let i = 0; i < nextPhoneData.length; i++) {
            for (let j = 0; j < phoneData.length; j++) {
                if (nextPhoneData[i].piSerialNumber === phoneData[j].piSerialNumber
                    && nextPhoneData[i].piLocationID === phoneData[j].piLocationID
                    && (nextPhoneData[i] as any).status !== (phoneData[j] as any).status) {
                    isChanged = true;
                    break;
                }
            }
            if (isChanged) {
                break;
            }
        }
        return isChanged;
    }
    /**
     * 开始取证按钮回调（采集一部手机）
     */
    collectHandle = (data: stPhoneInfoPara) => {
        this.piBrand = data.piBrand as BrandName;
        this.piModel = data.piModel as string;
        this.piSerialNumber = data.piSerialNumber as string;
        this.piLocationID = data.piLocationID as string;

        const { isEmptyUnit, isEmptyOfficer, isEmptyCase } = this.props.init;
        message.destroy();
        if (isEmptyUnit) {
            message.info('检验单位为空，请在设置→检验单位中配置');
            return;
        }
        if (isEmptyOfficer) {
            message.info('检验员信息为空，请在设置→检验员信息中添加');
            return;
        }
        if (isEmptyCase) {
            message.info('案件信息为空，请在设置→案件信息中添加');
            return;
        }

        this.setState({ caseModalVisible: true });
        this.phoneData = data; //寄存手机数据，采集时会使用
    }
    /**
     * 详情按钮回调
     */
    detailHandle = (data: stPhoneInfoPara) => {
        ipcRenderer.send('collecting-detail', data);
        this.setState({ detailModalVisible: true });
    }
    /**
     * 详情取消回调
     */
    detailCancelHandle = () => {
        const { dispatch } = this.props;
        ipcRenderer.send('collecting-detail', null);
        dispatch({ type: 'init/clearTipsType' });
        this.setState({ detailModalVisible: false });
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
                    if (item.piSerialNumber === data.piSerialNumber
                        && item.piLocationID === data.piLocationID) {
                        let temp = {
                            ...item,
                            m_ConnectSate: ConnectSate.HAS_CONNECT,
                            status: PhoneInfoStatus.HAS_CONNECT //状态置回“已连接”
                        };
                        return temp;
                    } else {
                        return item;
                    }
                });
                dispatch({ type: 'init/setStatus', payload: updated });
                dispatch({ type: 'init/stop', payload: data.piSerialNumber! + data.piLocationID });
                tipsStore.remove(data.piSerialNumber! + data.piLocationID);
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
        //TODO: 增加4项显示内容
        this.m_strCaseName = caseData.m_strCaseName!;
        this.m_strDeviceHolder = caseData.m_strDeviceHolder!;
        this.m_strDeviceNumber = caseData.m_strDeviceNumber!;
        this.m_strClientName = caseData.m_ClientInfo!.m_strClientName;

        let updated = init.phoneData.map<stPhoneInfoPara>(item => {
            if (item.piSerialNumber === this.phoneData!.piSerialNumber
                && item.piLocationID === this.phoneData!.piLocationID) {
                return {
                    ...item,
                    m_strCaseName: caseData.m_strCaseName!,
                    m_strDeviceHolder: caseData.m_strDeviceHolder!,
                    m_strDeviceNumber: caseData.m_strDeviceNumber!,
                    m_strClientName: caseData.m_ClientInfo!.m_strClientName,
                    clock: moment('00:00:00', 'HH:mm:ss'),
                    status: PhoneInfoStatus.FETCHING
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
    usbDebugHandle = (id: string) => {
        this.setState({
            usbDebugModalVisible: true
        });
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
        const { piSerialNumber, piLocationID } = phoneData;
        let isShow = tipsStore.exist(piSerialNumber! + piLocationID);
        return isShow;
    }
    /**
     * 是否显示步骤提示框
     */
    isShowStepModal = (): boolean => {
        const { tipsType } = this.props.init;
        const { caseModalVisible, detailModalVisible } = this.state;
        if (tipsType === null) {
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
        dispatch({ type: 'init/setFetchResponseCode', payload: FetchResposeUI.USB_DEBUG_MOD_CLOSE });
        this.setState({
            usbDebugModalVisible: false
        });
    }
    /**
     * 关闭安装APK弹框
     */
    cancelApkInstallModal = () => {
        const { dispatch } = this.props;
        dispatch({ type: 'init/setFetchResponseCode', payload: FetchResposeUI.INSTALL_TZSAFE_CLOSE });
    }
    /**
     * 关闭降级备份弹框
     */
    cancelDegradeModal = () => {
        const { dispatch } = this.props;
        dispatch({ type: 'init/setFetchResponseCode', payload: FetchResposeUI.DOWNGRADE_BACKUP_CLOSE });
    }
    /**
     * 关闭数据提取弹框
     */
    cancelPromptModal = () => {
        const { dispatch } = this.props;
        dispatch({ type: 'init/setFetchResponseCode', payload: FetchResposeUI.TZSAFE_PERMISSION_CLOSE });
    }
    /**
     * 关闭三星助手弹框
     */
    cancelSamsungSmartSwitchModal = () => {
        const { dispatch } = this.props;
        dispatch({ type: 'init/setFetchResponseCode', payload: FetchResposeUI.SAMSUNG_BACKUP_PERMISSION_CLOSE });
    }
    /**
     * 步骤框用户完成
     */
    stepFinishHandle = () => {
        const { dispatch } = this.props;
        //操作完成
        this.operateFinished();
        //NOTE:用户采集完成后，将此手机的数据从SessionStorge中删除，不再显示“消息”链接
        tipsStore.remove(this.piSerialNumber + this.piLocationID);
        dispatch({ type: 'init/clearTipsType' });//关闭步骤框
    }
    /**
     * 步骤框用户取消
     */
    stepCancelHandle = () => {
        const { dispatch } = this.props;
        dispatch({ type: 'init/clearTipsType' });
    }
    /**
     * 消息链接Click回调
     * @param piSerialNumber 点击的手机序列号
     * @param piLocationID 点击的手机物理ID
     */
    msgLinkHandle = (phoneData: stPhoneInfoPara) => {
        const { piBrand, piModel, piSerialNumber, piLocationID } = phoneData;
        this.piBrand = piBrand!;
        this.piModel = piModel!;
        this.piSerialNumber = piSerialNumber!;
        this.piLocationID = piLocationID!;
        let tip = tipsStore.get(piSerialNumber! + piLocationID);
        if (helper.isNullOrUndefined(tip)) {
            console.log('SessionStorage中无此弹框数据...');
        } else {
            this.props.dispatch({
                type: 'init/setTipsType', payload: {
                    tipsType: tip.AppDataExtractType,
                    piBrand,
                    piSerialNumber,
                    piLocationID
                }
            });
        }
    }
    /**
     * 渲染手机信息组件
     */
    renderPhoneInfo(phoneData: stPhoneInfoPara[]): JSX.Element[] {
        if (helper.isNullOrUndefined(phoneData)) {
            return [];
        }
        let _this = this;
        let dom: Array<JSX.Element> = [];
        for (let i = 0; i < max; i++) {
            (function (index: number) {
                if (helper.isNullOrUndefined(phoneData[index])) {
                    dom.push(<div className="col" key={helper.getKey()}>
                        <div className="cell">
                            <div className="no">
                                <div>
                                    <Icon type="usb" />
                                    <span>{`终端${index + 1}`}</span>
                                </div>
                            </div>
                            <div className="place">
                                <PhoneInfo
                                    status={PhoneInfoStatus.WAITING}
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
                                    <Icon type="usb" />
                                    <span>{`终端${index + 1}`}</span>
                                </div>
                                <MsgLink
                                    isShow={_this.isShowMsgLink(phoneData[index])}
                                    clickHandle={() => _this.msgLinkHandle(phoneData[index])}>
                                    消息
                                </MsgLink>
                            </div>
                            <div className="place">
                                <PhoneInfo
                                    status={(phoneData[index] as any).status}
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
        const cols = this.renderPhoneInfo(init.phoneData);
        return <div className="init">
            <div className="bg">
                <div className="panel">
                    <div className="row">
                        {cols.slice(0, Math.trunc(max / 2))}
                    </div>
                    <div className="row">
                        {cols.slice(Math.trunc(max / 2), max)}
                    </div>
                </div>
            </div>

            <CaseInputModal
                visible={this.state.caseModalVisible}
                piBrand={this.piBrand}
                piModel={this.piModel}
                piSerialNumber={this.piSerialNumber}
                piLocationID={this.piLocationID}
                saveHandle={this.saveCaseHandle}
                cancelHandle={() => this.cancelCaseInputHandle()} />

            <DetailModal
                visible={this.state.detailModalVisible}
                cancelHandle={() => this.detailCancelHandle()} />

            <StepModal
                visible={this.isShowStepModal()}
                steps={steps(init.tipsType, init.piBrand)}
                width={1060}
                finishHandle={() => this.stepFinishHandle()}
                cancelHandle={() => this.stepCancelHandle()} />

            <ApkInstallModal
                visible={init.fetchResponseCode === FetchResposeUI.INSTALL_TZSAFE_CONFIRM}
                okHandle={this.cancelApkInstallModal} />
            <DegradeModal
                visible={init.fetchResponseCode === FetchResposeUI.DOWNGRADE_BACKUP}
                okHandle={this.cancelDegradeModal} />
            <PromptModal
                visible={init.fetchResponseCode === FetchResposeUI.TZSAFE_PERMISSION_CONFIRM}
                okHandle={this.cancelPromptModal} />
            <SamsungSmartSwitchModal
                visible={init.fetchResponseCode === FetchResposeUI.SAMSUNG_BACKUP_PERMISSION_CONFIRM}
                okHandle={this.cancelSamsungSmartSwitchModal} />
            <UsbDebugWithCloseModal
                visible={this.isShowUsbDebugModal()}
                okHandle={this.cancelUsbDebugHandle} />
        </div>;
    }
}

export default connect((state: IObject) => ({ 'init': state.init }))(Init);