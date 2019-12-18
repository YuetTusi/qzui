import React, { Component } from 'react';
import Icon from 'antd/lib/icon';
import Button from 'antd/lib/button';
import { PhoneInfoStatus } from './PhoneInfoStatus';
import { stPhoneInfoPara } from '@src/schema/stPhoneInfoPara';
import SystemType from '@src/schema/SystemType';
import './PhoneInfo.less';

interface IProp extends stPhoneInfoPara {
    status: PhoneInfoStatus;
    //打开USB调试链接回调
    usbDebugHandle?: (arg0: string) => void;
    //采集回调方法
    collectHandle: (arg0: any) => void;
    //详情回调方法
    detailHandle: (arg0: stPhoneInfoPara) => void;
    //停止采集回调方法
    stopHandle: (args0: stPhoneInfoPara) => void;
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
                            <a onClick={() => this.props.usbDebugHandle!(this.props.piSerialNumber! + this.props.piLocationID)}>
                                如何打开？
                            </a>
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
                        <i className={`phone-type ${this.props.piSystemType === SystemType.IOS ? 'iphone' : 'android'}`} />
                    </div>
                    <div className="details">
                        <div className="mark">
                            <i
                                title={`系统版本号：${this.props.piAndroidVersion}\n设备序列号：${this.props.piSerialNumber}\nUSB端口号：${this.props.piLocationID}`}
                                className={`brand ${(this.props.piMakerName as string).toLowerCase()}`} />
                            <div className="dt">
                                <div><label>品牌:</label><span>{this.props.piMakerName}</span></div>
                                <div><label>型号:</label><span>{this.props.piModel}</span></div>
                            </div>
                        </div>
                        <div className="case-data">
                            <span>&nbsp;</span>
                        </div>
                        <div className="btn">
                            <Button
                                type="primary"
                                icon="interaction"
                                onClick={() => this.props.collectHandle(this.props)}>
                                取证
                            </Button>
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
                                onClick={() => this.props.detailHandle(this.props as stPhoneInfoPara)}>
                                <Icon type="sync" spin={true} />
                                <span>详情</span>
                            </Button>
                            <Button
                                type="primary"
                                onClick={() => this.props.stopHandle(this.props as stPhoneInfoPara)}>
                                <Icon type="stop" />
                                <span>停止</span>
                            </Button>
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
                            <Button
                                type="primary"
                                icon="interaction"
                                onClick={() => this.props.collectHandle(this.props)}>
                                取证
                            </Button>
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