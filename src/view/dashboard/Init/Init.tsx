import React, { Component, ReactElement, MouseEvent } from 'react';
import { connect } from 'dva';
import './Init.less'
import { IObject, IComponent } from '@src/type/model';
import PhoneInfo from '@src/components/PhoneInfo/PhoneInfo';
import { stPhoneInfoPara } from '@src/schema/stPhoneInfoPara';
import { helper } from '@utils/helper';
import { PhoneInfoStatus } from '@src/components/PhoneInfo/PhoneInfoStatus';
import StepModal from '@src/components/StepModal/StepModal';
import { steps } from './steps';
import DetailModal from './components/DetailModal/DetailModal';
import UsbModal from '@src/components/TipsModal/UsbModal/UsbModal';
import ApkInstallModal from '@src/components/TipsModal/ApkInstallModal/ApkInstallModal';
import PromptModal from '@src/components/TipsModal/PromptModal/PromptModal';
import DegradeFailModal from '@src/components/TipsModal/DegradeFailModal/DegradeFailModal';
import DegradeModal from '@src/components/TipsModal/DegradeModal/DegradeModal';
import AppleModal from '@src/components/TipsModal/AppleModal/AppleModal';
import CaseInputModal from './components/CaseInputModal/CaseInputModal';
import { message } from 'antd';
import CFetchDataInfo from '@src/schema/CFetchDataInfo';

interface IProp extends IComponent {
    init: IObject;
}
interface IState {
    //显示案件输入框
    caseModalVisible: boolean;
    //采集详情框
    detailModalVisible: boolean;
}
/**
 * 初始化连接设备
 * 对应模型：model/dashboard/Init
 */
class Init extends Component<IProp, IState> {
    /**
     * 用户点采集时的默认手机品牌名
     */
    piMakerName: string;
    /**
     * 手机型号
     */
    piPhoneType: string;
    /**
     * 序列号
     */
    piSerialNumber: string;
    /**
     * 采集的手机数据（寄存）
     */
    phoneData: any;

    constructor(props: IProp) {
        super(props);
        this.state = {
            caseModalVisible: false,
            detailModalVisible: false
        };
        this.piMakerName = '';
        this.piPhoneType = '';
        this.piSerialNumber = '';
        this.phoneData = null;
    }
    // shouldComponentUpdate(nextProps: IProp, nextState: IState) {
    //     const { phoneData } = this.props.init;
    //     if (phoneData.length !== nextProps.init.phoneData.length) {
    //         return true;
    //     }
    //     console.log('旧：', phoneData);
    //     console.log('新：', nextProps.init.phoneData);
    //     let updated = phoneData.find((item: IObject, index: number) => {
    //         return item.m_ConnectSate != nextProps.init.phoneData[index].m_ConnectSate;
    //     });
    //     if (updated) {
    //         return true;
    //     } else if (this.state.caseModalVisible !== nextState.caseModalVisible) {
    //         return true;
    //     } else {
    //         return false;
    //     }
    // }
    componentDidMount() {
        const { dispatch } = this.props;
        dispatch({ type: 'init/queryEmptyCase' });
        dispatch({ type: 'init/queryEmptyOfficer' });
        dispatch({ type: 'init/queryEmptyUnit' });
    }
    /**
     * 开始取证按钮回调（采集一部手机）
     */
    collectHandle = (data: IObject) => {
        this.piMakerName = data.piMakerName;
        this.piPhoneType = data.piPhoneType;
        this.piSerialNumber = data.piSerialNumber;

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
    detailHandle() {
        this.setState({ detailModalVisible: true });
    }
    /**
     * 采集前保存案件数据
     */
    saveCaseHandle = (caseData: CFetchDataInfo) => {
        console.log(caseData);
        this.setState({ caseModalVisible: false });

        let phoneInfo = new stPhoneInfoPara({
            m_ConnectSate: this.phoneData.m_ConnectSate,
            dtSupportedOpt: 0,
            m_bIsConnect: this.phoneData.m_bIsConnect,
            piAndroidVersion: this.phoneData.piAndroidVersion,
            piCOSName: this.phoneData.piCOSName,
            piCOSVersion: this.phoneData.piCOSVersion,
            piDeviceName: this.phoneData.piDeviceName,
            piMakerName: this.phoneData.piMakerName,
            piPhoneType: this.phoneData.piPhoneType,
            piSerialNumber: this.phoneData.piSerialNumber,
            piSystemType: this.phoneData.piSystemType,
            piSystemVersion: this.phoneData.piSystemVersion,
            piLocationID: this.phoneData.piLocationID
        });

        //开始采集，派发此动作后后端会推送数据，打开步骤提示框
        this.props.dispatch({ type: 'init/startCollect', payload: phoneInfo });
        //开始采集
        this.startCollect();
    }
    /**
     * 开始采集
     */
    startCollect = () => {
        let updated = this.props.init.phoneData.map((item: IObject) => {
            if (item.piSerialNumber === this.phoneData.piSerialNumber
                && item.piLocationID === this.phoneData.piLocationID) {
                return {
                    ...item,
                    status: PhoneInfoStatus.FETCHING
                }
            } else {
                return item;
            }
        });
        this.props.dispatch({ type: 'init/setStatus', payload: updated });
        let phoneInfo = new stPhoneInfoPara({
            m_ConnectSate: this.phoneData.m_ConnectSate,
            dtSupportedOpt: 0,
            m_bIsConnect: this.phoneData.m_bIsConnect,
            piAndroidVersion: this.phoneData.piAndroidVersion,
            piCOSName: this.phoneData.piCOSName,
            piCOSVersion: this.phoneData.piCOSVersion,
            piDeviceName: this.phoneData.piDeviceName,
            piMakerName: this.phoneData.piMakerName,
            piPhoneType: this.phoneData.piPhoneType,
            piSerialNumber: this.phoneData.piSerialNumber,
            piSystemType: this.phoneData.piSystemType,
            piSystemVersion: this.phoneData.piSystemVersion,
            piLocationID: this.phoneData.piLocationID
        });
        this.props.dispatch({ type: 'init/operateFinished', payload: phoneInfo });
    }
    /**
     * 渲染手机信息组件
     */
    renderPhoneInfo(phoneData: Array<any>): ReactElement[] {
        if (helper.isNullOrUndefined(phoneData)) {
            return [];
        }

        let dom: Array<ReactElement> = [];
        for (let i = 0; i < 6; i++) {
            if (helper.isNullOrUndefined(phoneData[i])) {
                dom.push(<div className="col" key={helper.getKey()}>
                    <div className="cell">
                        <div className="no">
                            <span>{`终端${i + 1}`}</span>
                        </div>
                        <div className="place">
                            <PhoneInfo
                                status={PhoneInfoStatus.WAITING}
                                collectHandle={this.collectHandle}
                                detailHandle={this.detailHandle} />
                        </div>
                    </div>
                </div>);
            } else {
                dom.push(<div className="col" key={helper.getKey()}>
                    <div className="cell">
                        <div className="no">
                            <span>{`终端${i + 1}`}</span>
                        </div>
                        <div className="place">
                            <PhoneInfo
                                status={phoneData[i].status}
                                collectHandle={this.collectHandle}
                                detailHandle={this.detailHandle}
                                {...phoneData[i]} />
                        </div>
                    </div>
                </div>);
            }
        }
        return dom;
    }
    render(): ReactElement {
        const { init } = this.props;
        const cols = this.renderPhoneInfo(init.phoneData);
        return <div className="init">
            <div className="bg">
                <div className="panel">
                    <div className="row">
                        {cols.slice(0, 3)}
                    </div>
                    <div className="row">
                        {cols.slice(3, 6)}
                    </div>
                </div>
            </div>

            <CaseInputModal
                visible={this.state.caseModalVisible}
                piMakerName={this.piMakerName}
                piPhoneType={this.piPhoneType}
                piSerialNumber={this.piSerialNumber}
                saveHandle={this.saveCaseHandle}
                cancelHandle={() => this.setState({ caseModalVisible: false })} />

            <DetailModal
                visible={this.state.detailModalVisible}
                cancelHandle={() => this.setState({ detailModalVisible: false })} />

            <StepModal
                visible={init.tipsType !== null}
                steps={steps(init.tipsType, this.piMakerName)}
                width={1020}
                finishHandle={() => this.props.dispatch({ type: 'init/clearTipsType' })} />
        </div>;
    }
}

export default connect((state: IObject) => ({ 'init': state.init }))(Init);