import React, { Component, ReactElement, MouseEvent } from 'react';
import { connect } from 'dva';
import { ipcRenderer } from 'electron';
import { IObject, IComponent } from '@src/type/model';
import PhoneInfo from '@src/components/PhoneInfo/PhoneInfo';
import MsgLink from '@src/components/MsgLink/MsgLink';
import { stPhoneInfoPara } from '@src/schema/stPhoneInfoPara';
import { helper } from '@utils/helper';
import { PhoneInfoStatus } from '@src/components/PhoneInfo/PhoneInfoStatus';
import StepModal from '@src/components/StepModal/StepModal';
import { steps } from './steps';
import DetailModal from './components/DetailModal/DetailModal';
import CaseInputModal from './components/CaseInputModal/CaseInputModal';
import { message, Badge } from 'antd';
import CFetchDataInfo from '@src/schema/CFetchDataInfo';
import './Init.less'

interface IProp extends IComponent {
    init: IObject;
}
interface IState {
    //显示案件输入框
    caseModalVisible: boolean;
    //显示采集详情框
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
     * 物理USB端口
     */
    piLocationID: string;
    /**
     * 采集的手机数据（寄存）
     */
    phoneData: stPhoneInfoPara | null;

    constructor(props: IProp) {
        super(props);
        this.state = {
            caseModalVisible: false,
            detailModalVisible: false
        };
        this.piMakerName = '';
        this.piPhoneType = '';
        this.piSerialNumber = '';
        this.piLocationID = '';
        this.phoneData = null;
    }
    componentDidMount() {
        const { dispatch } = this.props;
        dispatch({ type: 'init/queryEmptyCase' });
        dispatch({ type: 'init/queryEmptyOfficer' });
        dispatch({ type: 'init/queryEmptyUnit' });
    }
    /**
     * 开始取证按钮回调（采集一部手机）
     */
    collectHandle = (data: stPhoneInfoPara) => {
        this.piMakerName = data.piMakerName as string;
        this.piPhoneType = data.piPhoneType as string;
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
    detailHandle = (piLocationID: string, piSerialNumber: string) => {
        console.log(piLocationID);
        console.log(piSerialNumber);
        ipcRenderer.send('collecting-detail', { piLocationID, piSerialNumber });
        this.setState({ detailModalVisible: true });
    }
    /**
     * 详情取消回调
     */
    detailCancelHandle = () => {
        ipcRenderer.send('collecting-detail', null);
        this.setState({ detailModalVisible: false });
    }
    /**
     * 采集前保存案件数据
     */
    saveCaseHandle = (caseData: CFetchDataInfo) => {
        const { dispatch } = this.props;

        this.setState({ caseModalVisible: false });

        let phoneInfo = new stPhoneInfoPara({
            m_ConnectSate: this.phoneData!.m_ConnectSate,
            dtSupportedOpt: 0,
            m_bIsConnect: this.phoneData!.m_bIsConnect,
            piAndroidVersion: this.phoneData!.piAndroidVersion,
            piCOSName: this.phoneData!.piCOSName,
            piCOSVersion: this.phoneData!.piCOSVersion,
            piDeviceName: this.phoneData!.piDeviceName,
            piMakerName: this.phoneData!.piMakerName,
            piPhoneType: this.phoneData!.piPhoneType,
            piSerialNumber: this.phoneData!.piSerialNumber,
            piSystemType: this.phoneData!.piSystemType,
            piSystemVersion: this.phoneData!.piSystemVersion,
            piLocationID: this.phoneData!.piLocationID
        });

        //开始采集，派发此动作后后端会推送数据，打开步骤提示框
        dispatch({ type: 'init/start', payload: { phoneInfo, caseData } });

        //操作完成
        this.operateFinished();
    }
    /**
     * 操作完成
     */
    operateFinished = () => {
        const { dispatch, init } = this.props;
        let updated = init.phoneData.map((item: stPhoneInfoPara) => {
            if (item.piSerialNumber === this.phoneData!.piSerialNumber
                && item.piLocationID === this.phoneData!.piLocationID) {
                return {
                    ...item,
                    status: PhoneInfoStatus.FETCHING
                }
            } else {
                return item;
            }
        });
        dispatch({ type: 'init/setStatus', payload: updated });
        let phoneInfo = new stPhoneInfoPara({
            m_ConnectSate: this.phoneData!.m_ConnectSate,
            dtSupportedOpt: 0,
            m_bIsConnect: this.phoneData!.m_bIsConnect,
            piAndroidVersion: this.phoneData!.piAndroidVersion,
            piCOSName: this.phoneData!.piCOSName,
            piCOSVersion: this.phoneData!.piCOSVersion,
            piDeviceName: this.phoneData!.piDeviceName,
            piMakerName: this.phoneData!.piMakerName,
            piPhoneType: this.phoneData!.piPhoneType,
            piSerialNumber: this.phoneData!.piSerialNumber,
            piSystemType: this.phoneData!.piSystemType,
            piSystemVersion: this.phoneData!.piSystemVersion,
            piLocationID: this.phoneData!.piLocationID
        });
        dispatch({ type: 'init/operateFinished', payload: phoneInfo });
    }
    /**
     * 渲染手机信息组件
     */
    renderPhoneInfo(phoneData: Array<IObject>): JSX.Element[] {
        if (helper.isNullOrUndefined(phoneData)) {
            return [];
        }

        let dom: Array<JSX.Element> = [];
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
                            <MsgLink isShow={true}>消息</MsgLink>
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
    render(): JSX.Element {
        const { dispatch, init } = this.props;
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
                piLocationID={this.piLocationID}
                saveHandle={this.saveCaseHandle}
                cancelHandle={() => this.setState({ caseModalVisible: false })} />

            <DetailModal
                visible={this.state.detailModalVisible}
                cancelHandle={() => this.detailCancelHandle()} />

            <StepModal
                visible={init.tipsType !== null}
                steps={steps(init.tipsType, this.piMakerName)}
                width={1020}
                finishHandle={() => dispatch({ type: 'init/clearTipsType' })} />
        </div>;
    }
}

export default connect((state: IObject) => ({ 'init': state.init }))(Init);