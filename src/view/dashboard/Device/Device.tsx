import { ipcRenderer } from 'electron';
import React, { Component } from 'react';
import { connect } from 'dva';
import uuid from 'uuid/v4';
import Button from 'antd/lib/button';
import { send } from '@src/service/tcpServer';
import { helper } from '@src/utils/helper';
import DeviceInfo from '@src/components/DeviceInfo/DeviceInfo';
import MsgLink from '@src/components/MsgLink/MsgLink';
import { calcRow } from './calcRow';
import { DeviceType } from '@src/schema/socket/DeviceType';
import { FetchState } from '@src/schema/socket/DeviceState';
import { Prop, State } from './ComponentType';
import CaseInputModal from './components/CaseInputModal/CaseInputModal';
import CFetchDataInfo from '@src/schema/CFetchDataInfo';
import UsbDebugWithCloseModal from '@src/components/TipsModal/UsbDebugWithCloseModal/UsbDebugWithCloseModal';
import AppleModal from '@src/components/TipsModal/AppleModal/AppleModal';
import './Device.less';

const DEVICE_COUNT: number = helper.readConf().max;

class Device extends Component<Prop, State> {
    /**
     * 当前采集的手机数据
     */
    currentDevice?: DeviceType;
    mockState?: FetchState;
    constructor(props: any) {
        super(props);
        this.state = {
            caseModalVisible: false,
            detailModalVisible: false,
            usbDebugWithCloseModalVisible: false,
            appleModalVisible: false
        }
        this.mockState = FetchState.Fetching;
    }
    /**
     * 用户通过弹框手输数据
     * @param data 采集数据
     */
    getCaseDataFromUser = (data: DeviceType) => {

        // const { isEmptyUnit, isEmptyDstUnit, isEmptyOfficer, isEmptyCase, isEmptyCasePath } = this.props.init;

        // message.destroy();
        // if (isEmptyCasePath) {
        //     message.info('未设置案件存储路径，请在设置→案件存储路径中配置');
        //     return;
        // }
        // if (isEmptyCase) {
        //     message.info('案件信息为空，请在案件信息中添加');
        //     return;
        // }
        // if (isEmptyUnit) {
        //     message.info('采集单位为空，请在设置→采集单位中配置');
        //     return;
        // }
        // if (isEmptyDstUnit) {
        //     message.info('目的检验单位为空，请在设置→目的检验单位中配置');
        //     return;
        // }
        // if (isEmptyOfficer) {
        //     message.info('采集人员为空，请在设置→采集人员信息中添加');
        //     return;
        // }

        this.setState({ caseModalVisible: true });
        this.currentDevice = data; //寄存手机数据，采集时会使用
    }
    /**
     * 开始取证按钮回调（采集一部手机）
     */
    collectHandle = (data: DeviceType) => {
        this.getCaseDataFromUser(data);
    }
    /**
     * 详情
     */
    detailHandle = (data: DeviceType) => {
        console.log(data);
        this.setState({ detailModalVisible: true });
    }
    /**
     * 详情框取消
     */
    cancelDetailHandle = () => {
        this.setState({ detailModalVisible: false });
    }
    /**
     * 停止按钮回调
     */
    stopHandle = (data: DeviceType) => {
        console.log('停止取证', data);
    }
    /**
     * 采集前保存案件数据
     * @param caseData 案件数据
     */
    fetchInputHandle = (caseData: CFetchDataInfo) => {

        const { dispatch } = this.props;

        console.log(caseData);

        //LEGACY:采集前，将设备数据入库
        let deviceData: DeviceType = { ...this.currentDevice };
        deviceData.mobileHolder = caseData.m_strDeviceHolder;
        deviceData.mobileNo = caseData.m_strDeviceNumber;
        deviceData.mobileName = caseData.m_strDeviceName;
        deviceData.fetchTime = new Date();
        deviceData.id = uuid();
        dispatch({
            type: 'device/saveDeviceToCase', payload: {
                id: caseData.caseId,
                data: deviceData
            }
        });


        // const { dispatch, init } = this.props;

        // this.setState({ caseModalVisible: false });
        // dispatch({ type: 'init/clearTipsType' });

        // let pos = caseData.m_strCaseName!.lastIndexOf('\\');
        // let caseName = caseData.m_strCaseName!.substring(pos + 1);
        // caseData.m_strCaseName = caseName;

        // //NOTE:开始采集数据，派发此动作后后端会推送数据，打开步骤框
        // dispatch({ type: 'init/start', payload: { caseData } });

        // let updated = init.phoneData.map<stPhoneInfoPara>(item => {
        //     if (item?.piSerialNumber === this.phoneData!.piSerialNumber
        //         && item?.piLocationID === this.phoneData!.piLocationID) {
        //         //#再次采集前要把之间的案件数据清掉
        //         caseStore.remove(item.piSerialNumber! + item.piLocationID);
        //         caseStore.set({
        //             id: item.piSerialNumber! + item.piLocationID,
        //             m_strCaseName: caseData.m_strCaseName!,
        //             m_strDeviceHolder: caseData.m_strDeviceHolder!,
        //             m_strDeviceNumber: caseData.m_strDeviceNumber!
        //             // m_strClientName: caseData.m_ClientInfo!.m_strClientName
        //         });
        //         return {
        //             ...item,
        //             status: ConnectState.FETCHING
        //         }
        //     } else {
        //         return item;
        //     }
        // });
        // dispatch({ type: 'init/setStatus', payload: updated });
        // dispatch({ type: 'init/setHasFetching', payload: true });
    }
    /**
     * 采集输入框取消Click
     */
    cancelCaseInputHandle = () => {
        // const { dispatch } = this.props;
        // dispatch({ type: 'init/clearTipsType' });
        this.setState({ caseModalVisible: false });
    }
    renderPhoneInfo(device: DeviceType[]): JSX.Element[] {
        if (helper.isNullOrUndefined(device)) {
            return [];
        }
        let dom: Array<JSX.Element> = [];
        for (let i = 0; i < DEVICE_COUNT; i++) {
            if (helper.isNullOrUndefined(device[i])) {
                dom.push(<div className="col" key={helper.getKey()}>
                    <div className="cell">
                        <div className="no">
                            <div>
                                <i className="terminal" />
                                <span>{`终端${i + 1}`}</span>
                            </div>
                        </div>
                        <div className="place">
                            <DeviceInfo
                                {...device[i]}
                                collectHandle={this.collectHandle}
                                stopHandle={this.stopHandle} />
                        </div>
                    </div>
                </div>);
            } else {
                dom.push(<div className="col" key={helper.getKey()}>
                    <div className="cell">
                        <div className="no">
                            <div>
                                <i className="terminal" />
                                <span>{`终端${i + 1}`}</span>
                            </div>
                            {/* <div>
                                <MsgLink
                                    show={true}
                                    clickHandle={() => alert(i)}>
                                    消息
                                </MsgLink>
                                <MsgLink
                                    show={true}
                                    clickHandle={() => alert(i)}>
                                    安装APK
                                </MsgLink>
                            </div> */}

                        </div>
                        <div className="place">
                            <DeviceInfo
                                {...device[i]}
                                collectHandle={this.collectHandle}
                                stopHandle={this.stopHandle} />
                        </div>
                    </div>
                </div>);
            }
        }
        return dom;
    }
    render(): JSX.Element {
        const cols = this.renderPhoneInfo(this.props.device.deviceList);
        return <div className="device-root">
            <div className="button-bar">
                <label>操作提示：</label>
                <Button onClick={() => this.setState({ usbDebugWithCloseModalVisible: true })}>
                    打开USB调试
                </Button>
                <Button onClick={() => this.setState({ appleModalVisible: true })}>
                    iPhone授权
                </Button>
                <Button onClick={() => {
                    let mock: DeviceType = {
                        brand: 'xiaomi',
                        model: 'mi10',
                        system: 'android',
                        usb: '1',
                        fetchState: this.mockState === FetchState.Fetching ? FetchState.Finished : FetchState.Fetching
                    }
                    if (this.mockState === FetchState.Finished) {
                        ipcRenderer.send('time', 1 - 1, true);
                    } else {
                        ipcRenderer.send('time', 1 - 1, false);
                    }
                    this.props.dispatch({ type: 'device/setDevice', payload: mock });
                    this.mockState = this.mockState === FetchState.Fetching ? FetchState.Finished : FetchState.Fetching;
                }
                }>1</Button>
                <Button onClick={() => {
                    let mock: DeviceType = {
                        brand: 'realme',
                        model: 'T30',
                        system: 'android',
                        usb: '2',
                        fetchState: FetchState.NotConnected
                    }
                    this.props.dispatch({ type: 'device/setDevice', payload: mock });
                }
                }>2</Button>
                <Button onClick={() => {
                    let mock: DeviceType = {
                        brand: 'iqoo',
                        model: 'iqoo s9710',
                        system: 'android',
                        usb: '3',
                        fetchState: FetchState.Connected
                    }
                    this.props.dispatch({ type: 'device/setDevice', payload: mock });
                }
                }>3</Button>
                <Button onClick={() => {
                    let mock: DeviceType = {
                        brand: 'vivo',
                        model: 'vivo s9710',
                        system: 'android',
                        usb: '4',
                        fetchState: FetchState.Connected
                    }
                    this.props.dispatch({ type: 'device/setDevice', payload: mock });
                }
                }>4</Button>
                <Button onClick={() => {
                    let mock: DeviceType = {
                        brand: 'htc',
                        model: 'htc',
                        system: 'android',
                        usb: '5',
                        fetchState: FetchState.Fetching
                    }
                    this.props.dispatch({ type: 'device/setDevice', payload: mock });
                    // ipcRenderer.send('time', 5 - 1, true);
                }
                }>5</Button>
                <Button onClick={() => {
                    let mock: DeviceType = {
                        brand: 'oppo',
                        model: 'reno',
                        system: 'android',
                        usb: '6',
                        fetchState: FetchState.Finished
                    }
                    this.props.dispatch({ type: 'device/setDevice', payload: mock });
                }
                }>6</Button>
                <Button onClick={() => {
                    let mock: DeviceType = {
                        brand: 'oneplus',
                        model: '7T',
                        system: 'android',
                        usb: '7',
                        fetchState: FetchState.Connected
                    }
                    this.props.dispatch({ type: 'device/setDevice', payload: mock });
                    // ipcRenderer.send('time', 5 - 1, true);
                }
                }>7</Button>
                <Button onClick={() => {
                    let mock: DeviceType = {
                        brand: 'nokia',
                        model: 'nokia',
                        system: 'android',
                        usb: '8',
                        fetchState: FetchState.Connected
                    }
                    this.props.dispatch({ type: 'device/setDevice', payload: mock });
                    // ipcRenderer.send('time', 5 - 1, true);
                }
                }>8</Button>
            </div>
            <div className={DEVICE_COUNT <= 2 ? 'panel only2' : 'panel'}>
                {calcRow(cols)}
            </div>
            <CaseInputModal
                visible={this.state.caseModalVisible}
                device={this.currentDevice}
                // piBrand={this.phoneData?.brand}
                // piModel={this.phoneData?.model}
                // piSerialNumber={''}
                // piLocationID={''}
                // piUserlist={[]}
                saveHandle={this.fetchInputHandle}
                cancelHandle={() => this.cancelCaseInputHandle()} />
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