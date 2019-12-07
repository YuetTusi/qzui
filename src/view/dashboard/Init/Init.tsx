import React, { Component } from 'react';
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
import message from 'antd/lib/message';
import CFetchDataInfo from '@src/schema/CFetchDataInfo';
import { CCheckerInfo } from '@src/schema/CCheckerInfo';
// import sessionStore from '@utils/sessionStore';
import { tipsStore } from '@utils/sessionStore';
import './Init.less';

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
     * NOTE:渲染优化，调试时请注释掉
     */
    shouldComponentUpdate(nextProps: IProp, nextState: IState) {
        const { phoneData } = this.props.init;
        const { phoneData: nextPhoneData } = nextProps.init;

        if (phoneData.length !== nextPhoneData.length) {
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
        ipcRenderer.send('collecting-detail', { piLocationID, piSerialNumber });
        this.setState({ detailModalVisible: true });
    }
    /**
     * 详情取消回调
     */
    detailCancelHandle = () => {
        const { dispatch } = this.props;
        ipcRenderer.send('collecting-detail', null);
        dispatch({ type: 'init/clearTipsType' })
        this.setState({ detailModalVisible: false });
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
    isShowMsgLink = (phoneData: IObject) => {
        const { piSerialNumber, piLocationID } = phoneData;
        return tipsStore.exist(piSerialNumber + piLocationID);
    }
    isShowStepModal = () => {
        const { tipsType } = this.props.init;
        const { caseModalVisible, detailModalVisible } = this.state;
        if (tipsType === null) {
            return false;
        } else if (caseModalVisible || detailModalVisible) {
            return false;
        } else {
            return true;
        }
    }
    /**
     * 步骤框用户完成
     */
    stepFinishHandle = () => {
        const { dispatch } = this.props;
        //操作完成
        this.operateFinished();
        //note:用户操作完成后，将此手机的数据从SessionStorge中删除，不再显示“消息”链接
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
    msgLinkHandle = (phoneData: IObject) => {
        const { piMakerName, piPhoneType, piSerialNumber, piLocationID } = phoneData;
        this.piMakerName = piMakerName;
        this.piPhoneType = piPhoneType;
        this.piSerialNumber = piSerialNumber;
        this.piLocationID = piLocationID;
        let tip = tipsStore.get(piSerialNumber + piLocationID);
        if (helper.isNullOrUndefined(tip)) {
            console.log('SessionStorage中无此弹框数据...');
        } else {
            this.props.dispatch({
                type: 'init/setTipsType', payload: {
                    tipsType: tip.AppDataExtractType
                    // piLocationID,
                    // piSerialNumber
                }
            });
        }
    }
    /**
     * 渲染手机信息组件
     */
    renderPhoneInfo(phoneData: Array<IObject>): JSX.Element[] {
        if (helper.isNullOrUndefined(phoneData)) {
            return [];
        }
        let _this = this;
        let dom: Array<JSX.Element> = [];
        for (let i = 0; i < 6; i++) {
            (function (index: number) {
                if (helper.isNullOrUndefined(phoneData[index])) {
                    dom.push(<div className="col" key={helper.getKey()}>
                        <div className="cell">
                            <div className="no">
                                <span>{`终端${index + 1}`}</span>
                            </div>
                            <div className="place">
                                <PhoneInfo
                                    status={PhoneInfoStatus.WAITING}
                                    collectHandle={_this.collectHandle}
                                    detailHandle={_this.detailHandle} />
                            </div>
                        </div>
                    </div>);
                } else {
                    dom.push(<div className="col" key={helper.getKey()}>
                        <div className="cell">
                            <div className="no">
                                <span>{`终端${index + 1}`}</span>
                                <MsgLink
                                    isShow={_this.isShowMsgLink(phoneData[index])}
                                    clickHandle={() => _this.msgLinkHandle(phoneData[index])}>
                                    消息
                                </MsgLink>
                            </div>
                            <div className="place">
                                <PhoneInfo
                                    status={phoneData[index].status}
                                    collectHandle={_this.collectHandle}
                                    detailHandle={_this.detailHandle}
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
                cancelHandle={() => this.cancelCaseInputHandle()} />

            <DetailModal
                visible={this.state.detailModalVisible}
                cancelHandle={() => this.detailCancelHandle()} />

            <StepModal
                visible={this.isShowStepModal()}
                steps={steps(init.tipsType, this.piMakerName)}
                width={1060}
                finishHandle={() => this.stepFinishHandle()}
                cancelHandle={() => this.stepCancelHandle()} />
        </div>;
    }
}

export default connect((state: IObject) => ({ 'init': state.init }))(Init);