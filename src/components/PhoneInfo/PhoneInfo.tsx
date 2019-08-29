import React, { ReactElement, Component } from 'react';
import { Icon, Button } from 'antd';
import { IComponent } from '@type/model';
import './PhoneInfo.less';

interface IProp {
    //是否已连接
    isConnected: boolean;
    //设备ID（手机唯一标识）
    m_nDevID?: string,
    //手机品牌
    piMakerName?: string,
    //型号
    piPhoneType?: string
}

/**
 * 手机连接信息组件
 */
class PhoneInfo extends Component<IProp>{
    constructor(props: IProp) {
        super(props);
    }
    renderByConnected(isConnected: boolean): ReactElement {
        if (isConnected) {
            return <div className="connected">
                <div className="img">
                    <i className="phone-type iphone"></i>
                </div>
                <div className="details">
                    <div className="title">手机连接成功</div>
                    <div className="mark">
                        <i className="brand apple"></i>
                        <span>Apple iPhone 7 plus</span>
                    </div>
                    <div className="btn">
                        <Button type="primary">数据采集</Button>
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