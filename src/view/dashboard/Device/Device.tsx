import React, { Component, ReactElement } from 'react';
import { connect } from 'dva';
import { send } from '@src/service/tcpServer';
import { helper } from '@src/utils/helper';
import './Device.less';
import DeviceInfo from '@src/components/DeviceInfo/DeviceInfo';
import MsgLink from '@src/components/MsgLink/MsgLink';
import { calcRow } from './calcRow';
import { DeviceType } from '@src/schema/socket/DeviceType';
import { DeviceState } from '@src/schema/socket/DeviceState';
import { Prop, State } from './ComponentType';
import CaseInputModal from '../Init/components/CaseInputModal/CaseInputModal';
import CFetchDataInfo from '@src/schema/CFetchDataInfo';

const DEVICE_COUNT: number = helper.readConf().max;

class Device extends Component<Prop, State> {
    /**
     * 当前采集的手机数据
     */
    phoneData?: DeviceType;
    constructor(props: any) {
        super(props);
        this.state = {
            caseModalVisible: false
        }
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
        this.phoneData = data; //寄存手机数据，采集时会使用
    }
    /**
     * 开始取证按钮回调（采集一部手机）
     */
    collectHandle = (data: DeviceType) => {
        this.getCaseDataFromUser(data);
    }
    /**
     * 停止按钮回调
     */
    stopHandle = (data: DeviceType) => {
    }
    /**
     * 采集前保存案件数据
     * @param caseData 案件数据
     */
    saveCaseHandle = (caseData: CFetchDataInfo) => {
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
        const { dispatch } = this.props;
        // dispatch({ type: 'init/clearTipsType' });
        this.setState({ caseModalVisible: false });
    }
    renderPhoneInfo(phoneData: DeviceType[]): JSX.Element[] {
        if (helper.isNullOrUndefined(phoneData)) {
            return [];
        }
        let _this = this;
        let dom: Array<JSX.Element> = [];
        for (let i = 0; i < DEVICE_COUNT; i++) {
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
                                <DeviceInfo
                                    {...phoneData[i]}
                                    collectHandle={_this.collectHandle}
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
                                {/* <MsgLink
                                    isShow={_this.isShowMsgLink(phoneData[index])}
                                    clickHandle={() => _this.msgLinkHandle(phoneData[index])}>
                                    消息
                                </MsgLink> */}
                            </div>
                            <div className="place">
                                <DeviceInfo
                                    {...phoneData[i]}
                                    collectHandle={_this.collectHandle}
                                    stopHandle={_this.stopHandle} />
                            </div>
                        </div>
                    </div>);
                }
            })(i);
        }
        return dom;
    }
    render(): ReactElement {
        const cols = this.renderPhoneInfo(this.props.device.deviceList);
        return <div className="device-root">
            <div>
                <button type="button" onClick={() => {
                    let mock: DeviceType = {
                        brand: 'samsung',
                        model: 'A90',
                        system: 'android',
                        usb: '1',
                        state: DeviceState.Connected
                    }
                    this.props.dispatch({ type: 'device/setDevice', payload: mock });
                }
                }>1</button>
                <button type="button" onClick={() => {
                    let mock: DeviceType = {
                        brand: 'samsung',
                        model: 'A90',
                        system: 'android',
                        usb: '2',
                        state: DeviceState.NotConnected
                    }
                    this.props.dispatch({ type: 'device/setDevice', payload: mock });
                }
                }>2</button>
                <button type="button" onClick={() => {
                    let mock: DeviceType = {
                        brand: 'Apple',
                        model: 'iPhone7',
                        system: 'ios',
                        usb: '4',
                        state: DeviceState.Fetching
                    }
                    this.props.dispatch({ type: 'device/setDevice', payload: mock });
                }
                }>4</button>
                <button type="button" onClick={() => {
                    let mock: DeviceType = {
                        brand: 'sony',
                        model: 'sony',
                        system: 'android',
                        usb: '5',
                        state: DeviceState.Fetching
                    }
                    this.props.dispatch({ type: 'device/setDevice', payload: mock });
                }
                }>5</button>
                <button type="button" onClick={() => {
                    let mock: DeviceType = {
                        brand: 'huawei',
                        model: 'P30',
                        system: 'android',
                        usb: '6',
                        state: DeviceState.Finished
                    }
                    this.props.dispatch({ type: 'device/setDevice', payload: mock });
                }
                }>6</button>
            </div>
            <div className={DEVICE_COUNT <= 2 ? 'panel only2' : 'panel'}>
                {calcRow(cols)}
            </div>
            <CaseInputModal
                visible={this.state.caseModalVisible}
                piBrand={this.phoneData?.brand}
                piModel={this.phoneData?.model}
                piSerialNumber={''}
                piLocationID={''}
                piUserlist={[]}
                saveHandle={this.saveCaseHandle}
                cancelHandle={() => this.cancelCaseInputHandle()} />
        </div>;
    }
}
export default connect((state: any) => ({ device: state.device }))(Device);