import { ipcRenderer, remote } from 'electron';
import React, { Component } from 'react';
import { connect } from 'dva';
import Button from 'antd/lib/button';
import message from 'antd/lib/message';
import Modal from 'antd/lib/modal';
import { send } from '@src/service/tcpServer';
import { helper } from '@src/utils/helper';
import { calcRow, renderDevices } from './renderDevice';
import { DeviceType } from '@src/schema/socket/DeviceType';
import { FetchState } from '@src/schema/socket/DeviceState';
import { TipType } from '@src/schema/socket/TipType';
import FetchData from '@src/schema/socket/FetchData';
import CommandType, { SocketType } from '@src/schema/socket/Command';
import { withModeButton } from '@src/components/ModeButton/modeButton';
import HelpModal from '@src/components/guide/HelpModal/HelpModal';
import GuideModal from '@src/components/guide/GuideModal/GuideModal';
import CaseInputModal from './components/CaseInputModal/CaseInputModal';
import LiveModal from '@src/components/RecordModal/LiveModal';
import UsbDebugWithCloseModal from '@src/components/TipsModal/UsbDebugWithCloseModal/UsbDebugWithCloseModal';
import AppleModal from '@src/components/TipsModal/AppleModal/AppleModal';
import { Prop, State } from './ComponentType';
import './Device.less';

const deviceCount: number = helper.readConf().max;
const ModeButton = withModeButton()(Button);

class Device extends Component<Prop, State> {
    /**
     * 当前采集的手机数据
     */
    currentDevice: DeviceType;
    /**
     * 当前正在查看记录的USB序号
     */
    currentUsb?: number;

    constructor(props: any) {
        super(props);
        this.state = {
            caseModalVisible: false,
            fetchRecordModalVisible: false,
            usbDebugWithCloseModalVisible: false,
            appleModalVisible: false,
            helpModalVisible: false,
            guideModalVisible: false
        }
        this.currentDevice = {};
    }
    componentDidMount() {
        const { dispatch } = this.props;
        dispatch({ type: 'device/queryEmptyCase' });
    }
    /**
     * 用户通过弹框手输数据
     * @param data 采集数据
     */
    getCaseDataFromUser = (data: DeviceType) => {

        const { isEmptyCase } = this.props.device;
        if (isEmptyCase) {
            message.info({
                content: '无案件数据，请在「案件管理」中创建案件'
            });
        } else {
            this.setState({ caseModalVisible: true });
        }
    }
    /**
     * 开始取证按钮回调（采集一部手机）
     */
    collectHandle = (data: DeviceType) => {
        this.currentDevice = { ...data }; //寄存手机数据，采集时会使用
        this.getCaseDataFromUser(data);
    }
    /**
     * 异常记录回调
     */
    errorHandle = (data: DeviceType) => {
        this.currentUsb = data.usb;
        this.setState({ fetchRecordModalVisible: true });
    }
    /**
     * 详情框取消
     */
    cancelFetchRecordModalHandle = () => {
        this.currentUsb = undefined;
        this.setState({ fetchRecordModalVisible: false });
    }
    /**
     * 停止按钮回调
     */
    stopHandle = (data: DeviceType) => {
        const { dispatch } = this.props;
        console.log('停止取证', {
            type: SocketType.Fetch,
            cmd: CommandType.StopFetch,
            msg: {
                usb: data.usb
            }
        });
        ipcRenderer.send('time', data.usb! - 1, false);
        dispatch({
            type: 'device/updateProp', payload: {
                usb: data.usb,
                name: 'isStopping',
                value: true
            }
        });
        send(SocketType.Fetch, {
            type: SocketType.Fetch,
            cmd: CommandType.StopFetch,
            msg: {
                usb: data.usb
            }
        });
    }
    /**
     * 采集前保存案件数据
     * @param data 采集数据
     */
    fetchInputHandle = (fetchData: FetchData) => {
        const { dispatch } = this.props;
        this.setState({ caseModalVisible: false });
        dispatch({
            type: 'device/startFetch', payload: {
                deviceData: this.currentDevice,
                fetchData
            }
        });
    }
    /**
     * 消息链接Click
     * @param 当前device数据
     */
    msgLinkHandle = (data: DeviceType) => {
        const { dispatch } = this.props;
        this.currentDevice = { ...data };

        switch (this.currentDevice.tipType) {
            case TipType.Question:
                Modal.confirm({
                    content: this.currentDevice.tipMsg,
                    onOk() {
                        send(SocketType.Fetch, {
                            type: SocketType.Fetch,
                            cmd: CommandType.TipReply,
                            msg: { usb: data.usb, reply: 'yes' }
                        });
                        dispatch({ type: 'device/clearTip', payload: data.usb });
                    },
                    onCancel() {
                        send(SocketType.Fetch, {
                            type: SocketType.Fetch,
                            cmd: CommandType.TipReply,
                            msg: { usb: data.usb, reply: 'no' }
                        });
                        dispatch({ type: 'device/clearTip', payload: data.usb });
                    },
                    okText: '是',
                    cancelText: '否'
                });
                break;
            case TipType.Guide:
            case TipType.RequiredGuide:
                this.setState({ guideModalVisible: true });
                break;
            default:
                console.log('无此分类Tip');
                break;
        }
    }
    /**
     * 图标框用户点`是`
     */
    guideYesHandle = ({ usb }: DeviceType) => {
        const { dispatch } = this.props;
        send(SocketType.Fetch, {
            type: SocketType.Fetch,
            cmd: CommandType.TipReply,
            msg: { usb, reply: 'yes' }
        });
        dispatch({ type: 'device/clearTip', payload: usb });
        this.setState({ guideModalVisible: false });
    }
    /**
     * 图标框用户点`否`
     */
    guideNoHandle = ({ usb }: DeviceType) => {
        const { dispatch } = this.props;
        send(SocketType.Fetch, {
            type: SocketType.Fetch,
            cmd: CommandType.TipReply,
            msg: { usb, reply: 'no' }
        });
        dispatch({ type: 'device/clearTip', payload: usb });
        this.setState({ guideModalVisible: false });
    }
    /**
     * 采集输入框取消Click
     */
    cancelCaseInputHandle = () => {
        this.setState({ caseModalVisible: false });
    }
    render(): JSX.Element {
        const { deviceList } = this.props.device
        const cols = renderDevices(deviceList, this);

        return <div className="device-root">
            <div className="button-bar">
                <label>操作提示：</label>
                <ModeButton
                    icon="android"
                    onClick={() => this.setState({ usbDebugWithCloseModalVisible: true })}>
                    开启USB调试
                </ModeButton>
                <ModeButton
                    icon="apple"
                    onClick={() => this.setState({ appleModalVisible: true })}>
                    Apple授权
                </ModeButton>
                <ModeButton
                    icon="question-circle"
                    onClick={() => this.setState({ helpModalVisible: true })}>
                    操作帮助
                </ModeButton>
                <Button onClick={() => {
                    let mock: DeviceType = {
                        manufacturer: 'samsung',
                        model: 'A90',
                        system: 'android',
                        usb: 1,
                        tipType: TipType.Nothing,
                        fetchType: ['自带备份', '降级备份'],
                        fetchState: FetchState.Fetching
                    }
                    this.props.dispatch({ type: 'device/setDeviceToList', payload: mock });
                }
                }>1</Button>
                <Button onClick={() => {
                    let mock: DeviceType = {
                        manufacturer: 'xiaomi',
                        model: 'mi10',
                        system: 'android',
                        usb: 2,
                        tipType: TipType.Nothing,
                        fetchType: ['iTunes采集', '自带备份'],
                        fetchState: FetchState.Fetching
                    }
                    this.props.dispatch({ type: 'device/setDeviceToList', payload: mock });
                }
                }>2</Button>
                <Button onClick={() => {
                    remote.getCurrentWebContents().send('fetch-progress', {
                        usb: 1,
                        fetchRecord: { type: 2, info: '测试消息1111', time: new Date() }
                    });
                    remote.getCurrentWebContents().send('fetch-progress', {
                        usb: 2,
                        fetchRecord: { type: 1, info: '测试消息22222', time: new Date() }
                    });
                }
                }>Mock</Button>
            </div>
            <div className={deviceCount <= 2 ? 'panel only2' : 'panel'}>
                {calcRow(cols)}
            </div>
            <HelpModal
                visible={this.state.helpModalVisible}
                okHandle={() => this.setState({ helpModalVisible: false })}
                cancelHandle={() => this.setState({ helpModalVisible: false })} />
            <GuideModal
                {...this.currentDevice}
                visible={this.state.guideModalVisible}
                yesHandle={this.guideYesHandle}
                noHandle={this.guideNoHandle}
                cancelHandle={() => this.setState({ guideModalVisible: false })} />
            <CaseInputModal
                visible={this.state.caseModalVisible}
                device={this.currentDevice}
                saveHandle={this.fetchInputHandle}
                cancelHandle={() => this.cancelCaseInputHandle()} />
            <LiveModal
                usb={this.currentUsb!}
                visible={this.state.fetchRecordModalVisible}
                cancelHandle={this.cancelFetchRecordModalHandle} />
            <UsbDebugWithCloseModal
                visible={this.state.usbDebugWithCloseModalVisible}
                okHandle={() => this.setState({ usbDebugWithCloseModalVisible: false })} />
            <AppleModal
                visible={this.state.appleModalVisible}
                okHandle={() => this.setState({ appleModalVisible: false })} />
        </div>;
    }
}
export default connect((state: any) => ({ device: state.device }))(Device);