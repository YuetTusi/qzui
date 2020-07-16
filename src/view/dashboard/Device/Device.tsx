import { ipcRenderer } from 'electron';
import React, { Component } from 'react';
import { connect } from 'dva';
import classnames from 'classnames';
import Button from 'antd/lib/button';
import message from 'antd/lib/message';
import { send } from '@src/service/tcpServer';
import { helper } from '@src/utils/helper';
import DeviceInfo from '@src/components/DeviceInfo/DeviceInfo';
import MsgLink from '@src/components/MsgLink/MsgLink';
import { calcRow } from './calcRow';
import { DeviceType } from '@src/schema/socket/DeviceType';
import { FetchState } from '@src/schema/socket/DeviceState';
import { TipType } from '@src/schema/socket/TipType';
import FetchData from '@src/schema/socket/FetchData';
import FetchRecord, { ProgressType } from '@src/schema/socket/FetchRecord';
import CommandType, { SocketType } from '@src/schema/socket/Command';
import { Prop, State } from './ComponentType';
import BackupHelpModal from '@src/components/BackupHelpModal/BackupHelpModal';
import CaseInputModal from './components/CaseInputModal/CaseInputModal';
import RecordModal from '@src/components/RecordModal/RecordModal';
import UsbDebugWithCloseModal from '@src/components/TipsModal/UsbDebugWithCloseModal/UsbDebugWithCloseModal';
import AppleModal from '@src/components/TipsModal/AppleModal/AppleModal';
import './Device.less';

const DEVICE_COUNT: number = helper.readConf().max;

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
            debugHelpModalVisible: false
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
        this.currentDevice = data; //寄存手机数据，采集时会使用
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
        console.log('停止取证', {
            type: SocketType.Fetch,
            cmd: CommandType.StopFetch,
            msg: {
                usb: data.usb
            }
        });
        ipcRenderer.send('time', data.usb! - 1, false);
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
        //采集前，把上一次的进度记录清空
        dispatch({
            type: 'device/updateProp', payload: {
                usb: this.currentDevice.usb,
                name: 'fetchRecord',
                value: []
            }
        });
        dispatch({
            type: 'device/startFetch', payload: {
                deviceData: this.currentDevice,
                fetchData
            }
        });
    }
    /**
     * 采集输入框取消Click
     */
    cancelCaseInputHandle = () => {
        this.setState({ caseModalVisible: false });
    }
    /**
     * 根据USB序号取仓库中的FetchRecord数据
     */
    getFetchRecordByUsb = (usb?: number): FetchRecord[] => {
        const { deviceList } = this.props.device;
        if (usb) {
            return deviceList[usb - 1]?.fetchRecord!;
        } else {
            return [];
        }
    }
    /**
     * 渲染设备列表
     * @param device 设备列表
     */
    renderDevices(device: DeviceType[]): JSX.Element[] {
        if (helper.isNullOrUndefined(device)) {
            return [];
        }
        let dom: Array<JSX.Element> = [];
        for (let i = 0; i < DEVICE_COUNT; i++) {
            if (device[i] === undefined) {
                dom.push(<div className="col" key={helper.getKey()}>
                    <div className="cell">
                        <div className={classnames({ no: true, flash: false })}>
                            <div>
                                <i className="terminal" />
                                <span>{`终端${i + 1}`}</span>
                            </div>
                        </div>
                        <div className="place">
                            <DeviceInfo
                                fetchState={FetchState.Waiting}
                                collectHandle={this.collectHandle}
                                errorHandle={this.errorHandle}
                                stopHandle={this.stopHandle} />
                        </div>
                    </div>
                </div>);
            } else {
                dom.push(<div className="col" key={helper.getKey()}>
                    <div className="cell">
                        <div
                            className={classnames({
                                no: true,
                                flash: device[i].tip !== TipType.Nothing
                            })}>
                            <div>
                                <i className="terminal" />
                                <span>{`终端${i + 1}`}</span>
                            </div>
                            <div>
                                <MsgLink
                                    {...device[i]}
                                    show={device[i].tip !== TipType.Nothing}
                                    clickHandle={(data: DeviceType) => { console.log(data) }}>
                                    消息
                                </MsgLink>
                            </div>
                        </div>
                        <div className="place">
                            <DeviceInfo
                                {...device[i]}
                                collectHandle={this.collectHandle}
                                errorHandle={this.errorHandle}
                                stopHandle={this.stopHandle} />
                        </div>
                    </div>
                </div>);
            }
        }
        return dom;
    }
    render(): JSX.Element {
        const cols = this.renderDevices(this.props.device.deviceList);

        return <div className="device-root">
            <div className="button-bar">
                <label>操作提示：</label>
                <Button
                    icon="android"
                    onClick={() => this.setState({ usbDebugWithCloseModalVisible: true })}>
                    开启USB调试
                </Button>
                <Button
                    icon="apple"
                    onClick={() => this.setState({ appleModalVisible: true })}>
                    Apple授权
                </Button>
                <Button
                    icon="question-circle"
                    onClick={() => this.setState({ debugHelpModalVisible: true })}>
                    备份帮助
                </Button>
                <Button onClick={() => {
                    let mock: DeviceType = {
                        manufacturer: 'realme',
                        model: 'T30',
                        system: 'android',
                        usb: 1,
                        tip: TipType.Nothing,
                        fetchType: ['自带备份', '降级备份'],
                        fetchState: FetchState.NotConnected
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
                        tip: TipType.Nothing,
                        fetchType: ['iTunes采集', '自带备份'],
                        fetchState: FetchState.Connected
                    }
                    this.props.dispatch({ type: 'device/setDeviceToList', payload: mock });
                }
                }>2</Button>
                <Button type="primary" onClick={() => {
                    this.props.dispatch({
                        type: 'device/updateProp', payload: {
                            usb: 1,
                            name: 'tip',
                            value: TipType.Backup
                        }
                    });
                }}>
                    连入
                </Button>
            </div>
            <div className={DEVICE_COUNT <= 2 ? 'panel only2' : 'panel'}>
                {calcRow(cols)}
            </div>
            <BackupHelpModal
                visible={this.state.debugHelpModalVisible}
                defaultTab="vivo"
                okHandle={() => this.setState({ debugHelpModalVisible: false })}
                cancelHandle={() => this.setState({ debugHelpModalVisible: false })} />
            <CaseInputModal
                visible={this.state.caseModalVisible}
                device={this.currentDevice}
                saveHandle={this.fetchInputHandle}
                cancelHandle={() => this.cancelCaseInputHandle()} />
            <RecordModal
                data={this.getFetchRecordByUsb(this.currentUsb)}
                visible={this.state.fetchRecordModalVisible}
                cancelHandle={this.cancelFetchRecordModalHandle} />
            {/* 打开USB调试模式提示 */}
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