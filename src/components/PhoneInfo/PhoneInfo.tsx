import React, { ReactElement, Component, MouseEvent } from 'react';
import { Icon, Button, Spin } from 'antd';
import { PhoneType } from '@type/phone-type';
import { PhoneInfoStatus } from './PhoneInfoStatus';
import './PhoneInfo.less';

interface IProp {
    //组件状态
    status: PhoneInfoStatus;
    //设备ID（手机唯一标识）
    m_nDevID?: string,
    //手机品牌
    piMakerName?: string,
    //型号
    piPhoneType?: string,
    //系统类型
    piSystemType?: number,
    m_bIsConnect?: boolean,
    piAndroidVersion?: string,
    piCOSName?: string,
    piCOSVersion?: string,
    piDeviceName?: string,
    piSerialNumber?: string,
    piSystemVersion?: string,
    //采集回调方法
    collectHandle: Function
}



/**
 * 手机连接信息组件
 */
class PhoneInfo extends Component<IProp>{
    constructor(props: IProp) {
        super(props);
    }
    /**
     * 根据连接状态渲染组件
     * @param {PhoneInfoStatus} status 组件状态（枚举值）
     */
    renderByStatus(status: PhoneInfoStatus): ReactElement {

        switch (status) {
            case PhoneInfoStatus.CONNECTING:
                //连接中
                return <div className="connecting">
                    <div className="info">请连接USB</div>
                    <div className="lstatus">
                        <Icon type="loading" />
                    </div>
                </div>;
            case PhoneInfoStatus.CONNECTED:
                //已连接
                return <div className="connected">
                    <div className="img">
                        <div className="title">连接成功</div>
                        <i className={`phone-type ${this.props.piSystemType === PhoneType.IOS ? 'iphone' : 'android'}`}></i>
                    </div>
                    <div className="details">
                        <div className="mark">
                            <i className={`brand ${(this.props.piMakerName as string).toLowerCase()}`}></i>
                            <span>{this.props.piPhoneType}</span>
                        </div>
                        <div className="btn">
                            <Button type="primary" icon="form" onClick={() => this.props.collectHandle(this.props)}>取证</Button>
                        </div>
                    </div>
                </div>;

            case PhoneInfoStatus.READING:
                //采集中
                return <div className="connected">
                    <div className="progress"></div>
                    <div className="img">
                        <div className="title">正在取证</div>
                        <i className={`phone-type ${this.props.piSystemType === PhoneType.IOS ? 'iphone' : 'android'}`}></i>
                    </div>
                    <div className="details">

                        <div className="mark">
                            <i className={`brand ${(this.props.piMakerName as string).toLowerCase()}`}></i>
                            <span>{this.props.piPhoneType}</span>
                        </div>
                        <div className="case-data">
                            <label>当前状态</label>
                            <span>采集基本信息</span>
                        </div>
                        <div className="btn">
                            <Button type="primary" icon="form" disabled={true} onClick={() => this.props.collectHandle(this.props)}>取证</Button>
                            <Button type="primary" icon="profile" onClick={() => { }}>详情</Button>
                        </div>
                    </div>
                </div>;

            case PhoneInfoStatus.FINISH:
                return <div className="connected">
                    <div className="img">
                        <div className="title">取证完成</div>
                        <i className={`phone-type ${this.props.piSystemType === PhoneType.IOS ? 'iphone' : 'android'}`}></i>
                    </div>
                    <div className="details">
                        <div className="mark">
                            <i className={`brand ${(this.props.piMakerName as string).toLowerCase()}`}></i>
                            <span>{this.props.piPhoneType}</span>
                        </div>
                        <div className="case-data">
                        </div>
                        <div className="btn">
                            <Button type="primary" icon="form" onClick={() => this.props.collectHandle(this.props)}>取证</Button>
                        </div>
                    </div>
                </div>;
            default:
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
            {this.renderByStatus(this.props.status)}
        </div>;
    }
}

export default PhoneInfo;