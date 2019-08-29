import React, { ReactElement, Component, MouseEvent } from 'react';
import { Icon, Button } from 'antd';
import { PhoneType } from '@type/phone-type';
import './PhoneInfo.less';

interface IProp {
    //是否已连接
    isConnected: boolean;
    //设备ID（手机唯一标识）
    m_nDevID?: string,
    //手机品牌
    piMakerName?: string,
    //型号
    piPhoneType?: string,
    //系统类型
    piSystemType?: number
}

/**
 * 手机连接信息组件
 * isConnected属性若为false，渲染等待状态
 */
class PhoneInfo extends Component<IProp>{
    constructor(props: IProp) {
        super(props);
    }
    /**
     * 根据连接状态渲染组件
     * @param isConnected 是否已连接USB
     */
    renderByConnected(isConnected: boolean): ReactElement {
        if (isConnected) {
            return <div className="connected" data-dev-id={this.props.m_nDevID}>
                <div className="img">
                    <i className={`phone-type ${this.props.piSystemType === PhoneType.IOS ? 'iphone' : 'android'}`}></i>
                </div>
                <div className="details">
                    <div className="title">手机连接成功</div>
                    <div className="mark">
                        <i className={`brand ${(this.props.piMakerName as string).toLowerCase()}`}></i>
                        <span>{this.props.piPhoneType}</span>
                    </div>
                    <div className="btn">
                        <Button type="primary" icon="form">数据采集</Button>
                    </div>
                </div>
            </div>;
        } else {
            return <div className="connecting">
                <div className="info">请连接USB</div>
                <div className="lstatus">
                    <Icon type="loading" />
                </div>
            </div>;

        }
    }
    render(): ReactElement {
        return <div className="widget-phone-info">
            {this.renderByConnected(Boolean(this.props.isConnected))}
        </div>;
    }
}

export default PhoneInfo;