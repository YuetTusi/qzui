import React, { Component, ReactElement, MouseEvent } from 'react';
import { connect } from 'dva';
import './Init.less'
import { IObject, IComponent } from '@src/type/model';
import PhoneInfo from '@src/components/PhoneInfo/PhoneInfo';
import { stPhoneInfoPara } from '@src/schema/stPhoneInfoPara';
import { helper } from '@utils/helper';
import { PhoneInfoStatus } from '@src/components/PhoneInfo/PhoneInfoStatus';
import StepModal from '@src/components/StepModal/StepModal';
import huaweiSteps from '@src/components/StepModal/steps/HuaweiPc';

interface IProp extends IComponent {
    init: IObject;
}
interface IState { }
/**
 * 初始化连接设备
 * 对应模型：model/dashboard/Init
 */
class Init extends Component<IProp, IState> {
    constructor(props: IProp) {
        super(props);
    }
    /**
     * 开始取证按钮回调（采集一部手机）
     */
    collectHandle = (data: IObject) => {
        let updated = this.props.init.phoneData.map((item: IObject) => {
            if (item.piSerialNumber === data.piSerialNumber) {
                return {
                    ...item,
                    status: PhoneInfoStatus.READING
                }
            } else {
                return item;
            }
        });

        let phoneInfo = new stPhoneInfoPara({
            dtSupportedOpt: 0,
            m_bIsConnect: data.m_bIsConnect,
            m_nDevID: data.m_nDevID,
            piAndroidVersion: data.piAndroidVersion,
            piCOSName: data.piCOSName,
            piCOSVersion: data.piCOSVersion,
            piDeviceName: data.piDeviceName,
            piMakerName: data.piMakerName,
            piPhoneType: data.piPhoneType,
            piSerialNumber: data.piSerialNumber,
            piSystemType: data.piSystemType,
            piSystemVersion: data.piSystemVersion
        });
        this.props.dispatch({ type: 'init/setStatus', payload: updated });
        this.props.dispatch({ type: 'init/startCollect', payload: phoneInfo });   //开始采集
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
                            <PhoneInfo status={PhoneInfoStatus.CONNECTING} collectHandle={this.collectHandle} />
                        </div>
                    </div>
                </div>);
            } else {
                dom.push(<div className="col" key={helper.getKey()}>
                    <div className="cell">
                        <div className="no">
                            <span>{`终端${i + 1}`}</span>
                            <span>{`设备ID:${phoneData[i].m_nDevID}`}</span>
                        </div>
                        <div className="place">
                            <PhoneInfo status={phoneData[i].status} collectHandle={this.collectHandle} {...phoneData[i]} />
                        </div>
                    </div>
                </div>);
            }
        }
        return dom;
    }
    render(): ReactElement {
        const { init } = this.props;
        console.log(init.brandStep);
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
            <StepModal visible={init.brandStep === 'huawei'} steps={huaweiSteps} width={1000} finishHandle={
                () => this.props.dispatch({ type: 'init/setStepBrand', payload: null })
            } />
        </div>;
    }
}

export default connect((state: IObject) => {
    return { 'init': state.init }
})(Init);