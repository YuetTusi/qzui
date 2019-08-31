import React, { Component, ReactElement } from 'react';
import { connect } from 'dva';
import './Init.less'
import { IObject, IComponent } from '@src/type/model';
import PhoneInfo from '@src/components/PhoneInfo/PhoneInfo';
import { helper } from '@utils/helper';
import { Button } from 'antd';


interface IProp extends IComponent {
    init: IObject;
}
interface IState {

}

/**
 * 初始化连接设备
 * 对应模型：model/dashboard/Init
 */
class Init extends Component<IProp, IState> {
    constructor(props: IProp) {
        super(props);
    }
    shouldComponentUpdate(nextProp: IProp) {
        // if (this.props.init.phoneData.length !== nextProp.init.phoneData.length) console.log(nextProp.init.phoneData);
        return this.props.init.phoneData.length !== nextProp.init.phoneData.length;
    }
    /**
     * 渲染手机信息组件
     */
    renderPhoneInfo(phoneData: Array<any>): ReactElement[] {

        if (helper.isNullOrUndefined(phoneData)) {
            return [];
        }
        console.log(phoneData);

        let dom: Array<ReactElement> = [];
        for (let i = 0; i < 6; i++) {
            if (helper.isNullOrUndefined(phoneData[i])) {
                dom.push(<div className="col" key={helper.getKey()}>
                    <div className="cell">
                        <div className="no">
                            <span>{`终端${i + 1}`}</span>
                        </div>
                        <div className="place">
                            <PhoneInfo isConnected={false} />
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
                            <PhoneInfo isConnected={true} {...phoneData[0]} />
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
                    <div className="col-bar">
                        <Button type="primary" icon="form" disabled={init.phoneData.length === 0}
                            onClick={() => console.log(init.phoneData)}>多端取证</Button>
                    </div>
                    <div className="row">
                        {cols.slice(0, 3)}
                    </div>
                    <div className="row">
                        {cols.slice(3, 6)}
                    </div>
                </div>
            </div>
        </div>;
    }
}

export default connect((state: IObject) => {
    return { 'init': state.init }
})(Init);