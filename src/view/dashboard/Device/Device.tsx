import { ipcRenderer } from 'electron';
import React, { Component } from 'react';
import { connect } from 'dva';
import classnames from 'classnames';
import uuid from 'uuid/v4';
import Button from 'antd/lib/button';
import { send } from '@src/service/tcpServer';
import { helper } from '@src/utils/helper';
import DeviceInfo from '@src/components/DeviceInfo/DeviceInfo';
import MsgLink from '@src/components/MsgLink/MsgLink';
import { calcRow } from './calcRow';
import { caseStore } from '@src/utils/localStore';
import { DeviceType } from '@src/schema/socket/DeviceType';
import { FetchState } from '@src/schema/socket/DeviceState';
import CommandType, { SocketType } from '@src/schema/socket/Command';
import { Prop, State } from './ComponentType';
import BackupHelpModal from '@src/components/BackupHelpModal/BackupHelpModal';
import CaseInputModal from './components/CaseInputModal/CaseInputModal';
import RecordModal from '@src/components/RecordModal/RecordModal';
import FetchData from '@src/schema/socket/FetchData';
import UsbDebugWithCloseModal from '@src/components/TipsModal/UsbDebugWithCloseModal/UsbDebugWithCloseModal';
import AppleModal from '@src/components/TipsModal/AppleModal/AppleModal';
import './Device.less';
import { FetchLogState } from '@src/schema/socket/FetchLog';

const DEVICE_COUNT: number = helper.readConf().max;

class Device extends Component<Prop, State> {
    /**
     * 当前采集的手机数据
     */
    currentDevice: DeviceType;

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
    /**
     * 用户通过弹框手输数据
     * @param data 采集数据
     */
    getCaseDataFromUser = (data: DeviceType) => {

        //LEGACY:在此处判断设置中的必填信息

        this.setState({ caseModalVisible: true });
    }
    /**
     * 开始取证按钮回调（采集一部手机）
     */
    collectHandle = (data: DeviceType) => {
        this.currentDevice = data; //寄存手机数据，采集时会使用
        this.getCaseDataFromUser(data);
    }
    /**
     * 取证异常回调
     */
    errorHandle = (data: DeviceType) => {
        console.log(data);
        this.setState({ fetchRecordModalVisible: true });
    }
    /**
     * 详情框取消
     */
    cancelFetchRecordModalHandle = () => {
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
        ipcRenderer.send('time', Number(data.usb) - 1, false);
        this.props.dispatch({
            type: 'device/updateProp', payload: {
                usb: data.usb,
                name: 'fetchState',
                value: FetchState.Finished
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
    fetchInputHandle = (data: FetchData) => {

        const { dispatch } = this.props;
        this.setState({ caseModalVisible: false });

        //NOTE:采集前，将设备数据入库
        // let deviceData: DeviceType = { ...this.currentDevice };
        // deviceData.mobileHolder = data.mobileHolder;
        // deviceData.mobileNo = data.mobileNo;
        // deviceData.mobileName = data.mobileName;
        // deviceData.fetchTime = new Date();
        // deviceData.id = uuid();
        // dispatch({
        //     type: 'device/saveDeviceToCase', payload: {
        //         id: data.caseId,
        //         data: deviceData
        //     }
        // });

        //NOTE:再次采集前要把之间的案件数据清掉
        caseStore.remove(this.currentDevice.usb!);
        caseStore.set({
            usb: this.currentDevice.usb!,
            caseName: data.caseName!,
            mobileHolder: data.mobileHolder!,
            mobileNo: data.mobileNo!
        });
        //采集时把必要的数据更新到deviceList中
        dispatch({
            type: 'device/setDeviceToList', payload: {
                usb: this.currentDevice.usb,
                fetchState: FetchState.Fetching,
                brand: this.currentDevice.brand,
                model: this.currentDevice.model,
                system: this.currentDevice.system,
                mobileName: data.mobileName,
                mobileNo: data.mobileNo,
                mobileHolder: data.mobileHolder
            }
        });
        ipcRenderer.send('time', this.currentDevice.usb! - 1, true);
        console.log({
            type: SocketType.Fetch,
            cmd: CommandType.StartFetch,
            msg: {
                usb: this.currentDevice.usb!,
                caseName: data.caseName,
                casePath: data.casePath,
                appList: data.appList,
                mobileName: data.mobileName,
                mobileHolder: data.mobileHolder,
                fetchType: data.fetchType
            }
        });
        //# 通知fetch开始采集
        send(SocketType.Fetch, {
            type: SocketType.Fetch,
            cmd: CommandType.StartFetch,
            msg: {
                usb: this.currentDevice.usb!,
                caseName: data.caseName,
                casePath: data.casePath,
                appList: data.appList,
                mobileName: data.mobileName,
                mobileHolder: data.mobileHolder,
                fetchType: data.fetchType
            }
        });
    }
    /**
     * 采集输入框取消Click
     */
    cancelCaseInputHandle = () => {
        this.setState({ caseModalVisible: false });
    }
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
                            className={classnames({ no: true, flash: false })}>
                            <div>
                                <i className="terminal" />
                                <span>{`终端${i + 1}`}</span>
                            </div>
                            <div>
                                <MsgLink
                                    show={false}
                                    clickHandle={() => { }}>
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
                        brand: 'realme',
                        model: 'T30',
                        system: 'android',
                        usb: 1,
                        fetchType: ['自带备份', '降级备份'],
                        fetchState: FetchState.NotConnected
                    }
                    this.props.dispatch({ type: 'device/setDeviceToList', payload: mock });
                }
                }>1</Button>
                <Button onClick={() => {
                    let mock: DeviceType = {
                        brand: 'xiaomi',
                        model: 'mi10',
                        system: 'android',
                        usb: 2,
                        fetchType: ['iTunes采集', '自带备份'],
                        fetchState: FetchState.Connected
                    }
                    this.props.dispatch({ type: 'device/setDeviceToList', payload: mock });
                }
                }>2</Button>
                <Button type="primary" onClick={() => {
                    // this.props.dispatch({
                    //     type: 'device/saveFetchLog', payload: {
                    //         usb: 2,
                    //         state: FetchLogState.Success
                    //     }
                    // });
                    this.props.dispatch({
                        type: 'device/updateProp', payload: {
                            usb: 1,
                            name: 'fetchState',
                            value: FetchState.Connected
                        }
                    });
                }}>
                    连入
                </Button>
                <Button type="primary" onClick={() => {
                    this.props.dispatch({
                        type: 'device/removeDevice', payload: 1
                    });
                }}>
                    移除
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
                data={[{ type: '1', info: '测试1' }, { type: '1', info: '测试2' }]}
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