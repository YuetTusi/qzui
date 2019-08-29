import React, { Component, ReactElement } from 'react';
import { connect } from 'dva';
import { routerRedux } from 'dva/router';
import { Button } from 'antd';
import './Init.less'
import { IObject, IComponent } from '@src/type/model';




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
    shouldComponentUpdate(nextProp: IProp) {
        return this.props.init.m_nDevID !== nextProp.init.m_nDevID;
    }
    /**
     * 等待文字提示
     * @param devID 设备id
     */
    renderLoadingTxt(m_nDevID: any) {
        if (m_nDevID === null) {
            return <div className="title">请将设备连接到电脑并保持连接</div>;
        } else {
            return <div className="title success">手机正确识别，正在连接...</div>;
        }
    }
    /**
     * 小圆圈
     * @param m_nDevID 设备id
     */
    renderLoadingIcon(m_nDevID: any) {
        if (m_nDevID === null) {
            return <div></div>;
        } else {
            return <div className="phone-loading"></div>;
        }
    }
    /**
     * 返回手机品牌样式
     * @param phoneData 手机数据对象
     */
    renderBrand(phoneData: IObject) {
        if (phoneData.piMakerName) {
            //处理为小写对应CSS类
            return phoneData.piMakerName.toLowerCase();
        } else {
            return 'android';
        }
    }
    render(): ReactElement {
        const { init } = this.props;
        return <div className="init">
            <div>{this.props.init.data}</div>
            <div className="bg">
                <div className="panel">
                    <div className="inner-panel">
                        <div className="phone">
                            <div className="phone">
                                {this.renderLoadingIcon(init.m_nDevID)}
                            </div>
                        </div>
                        <div className="info">
                            {this.renderLoadingTxt(init.m_nDevID)}
                            <div className="sub-title">
                                <div>
                                    <i className={`brand ${this.renderBrand(init)}`} /><span>{init.piPhoneType}</span>
                                </div>
                            </div>
                            <div className="bar">请选择采集方式</div>
                            <div className="buttons">
                                <div className="line">
                                    <div className="btn">
                                        <Button type="primary">快速采集</Button>
                                    </div>
                                    <em>只采集基本信息、短信信息、联系人信息、通讯录信息</em>
                                </div>
                                <div className="line">
                                    <div className="btn">
                                        <Button type="primary" onClick={() => this.props.dispatch(routerRedux.push('/dashboard/collecting'))}>全面采集</Button>
                                    </div>
                                    <em>采集手机内所有信息,支持自定义勾选</em>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>;
    }
}

export default connect((state: IObject) => {
    return { 'init': state.init }
})(Init);