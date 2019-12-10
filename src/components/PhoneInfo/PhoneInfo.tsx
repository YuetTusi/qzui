import React, { Component } from 'react';
import { Icon, Button } from 'antd';
import { PhoneInfoStatus } from './PhoneInfoStatus';
import { stPhoneInfoPara } from '@src/schema/stPhoneInfoPara';
import SystemType from '@src/schema/SystemType';
import './PhoneInfo.less';

interface IProp extends stPhoneInfoPara {
    status: PhoneInfoStatus;
    //采集回调方法
    collectHandle: (arg0: any) => void;
    //详情回调方法
    detailHandle: (arg0: string, arg1: string) => void;
}

interface IState { };

/**
 * 手机连接信息组件
 */
class PhoneInfo extends Component<IProp, IState>{
    constructor(props: IProp) {
        super(props);
    }
    /**
     * 根据连接状态渲染组件
     * @param {PhoneInfoStatus} status 组件状态（枚举值）
     */
    renderByStatus(status: PhoneInfoStatus): JSX.Element {
        switch (status) {
            case PhoneInfoStatus.WAITING:
                //连接中
                return <div className="connecting">
                    <div className="info">请连接USB</div>
                    <div className="lstatus">
                        <Icon type="loading" />
                    </div>
                </div>;
            case PhoneInfoStatus.NOT_CONNECT:
                //已识别，但未连接上采集程序
                return <div className="connected">
                    <div className="img">
                        <div className="title">正在连接...</div>
                        <i className={`phone-type ${this.props.piSystemType === SystemType.IOS ? 'iphone' : 'android'}`}></i>
                    </div>
                    <div className="details">
                        <div className="mark">
                            <i className={`brand ${(this.props.piMakerName as string).toLowerCase()}`}></i>
                            <div className="dt">
                                <div><label>品牌:</label><span>{this.props.piMakerName}</span></div>
                                <div><label>型号:</label><span>{this.props.piModel}</span></div>
                            </div>
                        </div>
                        <div className="case-data">
                            <span>请打开USB调试</span>
                        </div>
                        <div className="btn">
                            <Button type="primary" icon="interaction" disabled={true}>取证</Button>
                        </div>
                    </div>
                </div>;
            case PhoneInfoStatus.HAS_CONNECT:
                //已连接，可进行采集
                return <div className="connected">
                    <div className="img">
                        <div className="title">已连接</div>
                        <i className={`phone-type ${this.props.piSystemType === SystemType.IOS ? 'iphone' : 'android'}`}></i>
                    </div>
                    <div className="details">
                        <div className="mark">
                            <i className={`brand ${(this.props.piMakerName as string).toLowerCase()}`}></i>
                            <div className="dt">
                                <div><label>品牌:</label><span>{this.props.piMakerName}</span></div>
                                <div><label>型号:</label><span>{this.props.piModel}</span></div>
                            </div>
                        </div>
                        <div className="btn">
                            <Button type="primary" icon="interaction" onClick={() => this.props.collectHandle(this.props)}>取证</Button>
                        </div>
                    </div>
                </div>;
            case PhoneInfoStatus.FETCHING:
                //采集中
                return <div className="connected">
                    <div className="progress"></div>
                    <div className="img">
                        <div className="title">正在取证...</div>
                        <i className={`phone-type ${this.props.piSystemType === SystemType.IOS ? 'iphone' : 'android'}`}></i>
                    </div>
                    <div className="details">

                        <div className="mark">
                            <i className={`brand ${(this.props.piMakerName as string).toLowerCase()}`}></i>
                            <div className="dt">
                                <div><label>品牌:</label><span>{this.props.piMakerName}</span></div>
                                <div><label>型号:</label><span>{this.props.piModel}</span></div>
                            </div>
                        </div>
                        <div className="case-data">
                            <span>采集中,请勿拔出USB</span>
                        </div>
                        <div className="btn">
                            <Button
                                type="primary"
                                icon="profile"
                                onClick={() => {
                                    this.props.detailHandle(this.props.piLocationID as string, this.props.piSerialNumber as string)
                                }}>详情</Button>
                        </div>
                    </div>
                </div>;
            case PhoneInfoStatus.FETCHEND:
                //采集结束
                return <div className="connected">
                    <div className="img">
                        <div className="title">取证完成</div>
                        <i className={`phone-type ${this.props.piSystemType === SystemType.IOS ? 'iphone' : 'android'}`}></i>
                    </div>
                    <div className="details">
                        <div className="mark">
                            <i className={`brand ${(this.props.piMakerName as string).toLowerCase()}`}></i>
                            <div className="dt">
                                <div><label>品牌:</label><span>{this.props.piMakerName}</span></div>
                                <div><label>型号:</label><span>{this.props.piModel}</span></div>
                            </div>
                        </div>
                        <div className="case-data">
                        </div>
                        <div className="btn">
                            <Button type="primary" icon="interaction" onClick={() => this.props.collectHandle(this.props)}>取证</Button>
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
    render(): JSX.Element {
        return <div className="widget-phone-info">
            {this.renderByStatus(this.props.status)}
        </div>;
    }
}

export default PhoneInfo;