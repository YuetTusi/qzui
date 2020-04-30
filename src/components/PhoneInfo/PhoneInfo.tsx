import React, { Component } from 'react';
import moment from 'moment';
import classnames from 'classnames';
import Icon from 'antd/lib/icon';
import Button from 'antd/lib/button';
import List from 'antd/lib/list';
import { PhoneInfoStatus } from './PhoneInfoStatus';
import { stPhoneInfoPara } from '@src/schema/stPhoneInfoPara';
import SystemType from '@src/schema/SystemType';
import { LeftUnderline } from '@utils/regex';
import { helper } from '@src/utils/helper';
import config from '@src/config/ui.yaml';
import { caseStore } from '@src/utils/localStore';
import { Prop, State } from './ComponentType';
import './PhoneInfo4Pad.less';
import './PhoneInfo.less';

let clockInitVal: string[] = []; //时钟初始值

for (let i = 0; i < config.max; i++) {
    clockInitVal.push('00:00:00');
}

/**
 * 手机连接信息组件
 */
class PhoneInfo extends Component<Prop, State>{
    timer: number | null;
    constructor(props: Prop) {
        super(props);
        this.state = {
            clock: ''
        };
        this.timer = null;
    }
    componentDidMount() {
        const { index } = this.props;
        const clock = moment(clockInitVal[index], 'HH:mm:ss');
        this.timer = window.setInterval(() => {
            clockInitVal[index] = clock.add(1, 's').format('HH:mm:ss');
            this.setState({
                clock: clockInitVal[index]
            });
        }, 1000);
    }
    componentWillUnmount() {
        if (this.timer) {
            clearInterval(this.timer);
        }
    }
    componentWillReceiveProps(nextProps: Prop) {
        if (nextProps.status !== PhoneInfoStatus.FETCHING && this.timer !== null) {
            clearInterval(this.timer);
        }
    }
    shouldComponentUpdate(nextProps: Prop, nextState: State) {
        if (nextProps.status !== this.props.status) {
            return true;
        } else if (nextState.clock !== this.state.clock) {
            return true;
        } else {
            return false;
        }
    }
    /**
     * 还原时钟初始值
     * @param index 组件索引
     */
    resetClock(index: number) {
        clockInitVal[index] = '00:00:00';
    }
    /**
     * 渲染时钟
     */
    renderClock() {
        const { clock } = this.state;
        if (clock == '') {
            //NOTE:当时钟为空时显示上一次记录的时间，否则渲染为空不友好
            return <span>{clockInitVal[this.props.index]}</span>;
        } else {
            return <span>{clock}</span>;
        }
    }
    /**
     * 等待状态vDOM
     */
    getDomByWaiting = (): JSX.Element => {
        this.resetClock(this.props.index);
        return <div className="connecting">
            <div className="info">请连接USB</div>
            <div className="lstatus">
                <Icon type="usb" />
            </div>
        </div>;
    }
    /**
     * 未连接状态vDOM
     */
    getDomByNotConnect = (): JSX.Element => {
        const { piSystemType } = this.props;
        this.resetClock(this.props.index);
        return <div className="connected">
            <div className="img">
                <div className="title">正在连接...</div>
                <i className={classnames('phone-type', {
                    large: config.max <= 2
                }, {
                    iphone: this.props.piSystemType === SystemType.IOS
                }, {
                    android: this.props.piSystemType === SystemType.ANDROID
                })}></i>
            </div>
            <div className="details">
                <div className="mark">
                    <i className={`brand ${config.max <= 2 ? 'large' : ''} ${(this.props.piMakerName as string).toLowerCase()}`}></i>
                    <div className="dt">
                        <div><label>品牌:</label><span>{this.props.piMakerName}</span></div>
                        <div><label>型号:</label><span>{this.props.piModel}</span></div>
                    </div>
                </div>
                <div className="case-data">
                    {this.renderDisconnectedInfo(piSystemType!)}
                </div>
                <div className="btn">
                    <Button
                        type="primary"
                        icon="interaction"
                        disabled={true}
                        size={config.max <= 2 ? 'large' : 'default'}>取证</Button>
                </div>
            </div>
        </div>;
    }
    /**
     * 已连接状态vDOM
     */
    getDomByHasConnect = (): JSX.Element => {
        this.resetClock(this.props.index);
        return <div className="connected">
            <div className="img">
                <div className="title">已连接</div>
                <i className={classnames('phone-type', {
                    large: config.max <= 2
                }, {
                    iphone: this.props.piSystemType === SystemType.IOS
                }, {
                    android: this.props.piSystemType === SystemType.ANDROID
                })}>
                </i>
            </div>
            <div className="details">
                <div className="mark">
                    <i
                        title={`系统版本号：${this.props.piAndroidVersion}\n设备序列号：${this.props.piSerialNumber}\nUSB端口号：${this.props.piLocationID}`}
                        className={`brand ${config.max <= 2 ? 'large' : ''} ${(this.props.piMakerName as string).toLowerCase()}`} />
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
                        size={config.max <= 2 ? 'large' : 'default'}
                        onClick={() => this.props.collectHandle(this.props)}>
                        取证
                    </Button>
                </div>
            </div>
        </div>;
    }
    /**
     * 采集中状态vDOM
     */
    getDomByFetching = (): JSX.Element => {
        return <div className="fetching">
            <div className="progress">
                <div className="case-data">
                    <span>采集中, 请勿拔出USB</span>
                </div>
            </div>
            <div className="phone-info">
                <div className="img">
                    <div className="title">正在取证...</div>
                    <i className={classnames('phone-type', {
                        large: config.max <= 2
                    }, {
                        iphone: this.props.piSystemType === SystemType.IOS
                    }, {
                        android: this.props.piSystemType === SystemType.ANDROID
                    })}>
                        {this.renderClock()}
                    </i>
                </div>
                <div className="details">
                    <div className="outer-box">
                        <div className="mark">
                            <i className={`brand ${config.max <= 2 ? 'large' : ''} ${(this.props.piMakerName as string).toLowerCase()}`} />
                            <div className="dt">
                                <div><label>品牌:</label><span>{this.props.piMakerName}</span></div>
                                <div><label>型号:</label><span>{this.props.piModel}</span></div>
                            </div>
                        </div>
                        <div className="case-info">
                            {this.renderCaseInfo(this.props)}
                        </div>
                        <div className="btn">
                            <Button
                                type="primary"
                                size={config.max <= 2 ? 'large' : 'default'}
                                onClick={() => this.props.detailHandle(this.props as stPhoneInfoPara)}>
                                <Icon type="sync" spin={true} />
                                <span>详情</span>
                            </Button>
                            <Button
                                type="primary"
                                size={config.max <= 2 ? 'large' : 'default'}
                                disabled={(this.props as any).isStopping}
                                onClick={() => this.props.stopHandle(this.props as stPhoneInfoPara)
                                }>
                                <Icon type="stop" />
                                <span>{(this.props as any).isStopping ? '停止中' : '停止'}</span>
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>;
    }
    /**
     * 采集完成状态vDOM
     */
    getDomByFetchEnd = (): JSX.Element => {
        this.resetClock(this.props.index);
        return <div className="fetching">
            <div className="phone-info">
                <div className="img">
                    <div className="title">取证完成</div>
                    <i className={classnames('phone-type', {
                        large: config.max <= 2
                    }, {
                        iphone: this.props.piSystemType === SystemType.IOS
                    }, {
                        android: this.props.piSystemType === SystemType.ANDROID
                    })}></i>
                </div>
                <div className="details">
                    <div className="outer-box">
                        <div className="mark">
                            <i className={`brand ${config.max <= 2 ? 'large' : ''} ${(this.props.piMakerName as string).toLowerCase()}`}></i>
                            <div className="dt">
                                <div><label>品牌:</label><span>{this.props.piMakerName}</span></div>
                                <div><label>型号:</label><span>{this.props.piModel}</span></div>
                            </div>
                        </div>
                        <div className="case-info">
                            {this.renderCaseInfo(this.props)}
                        </div>
                    </div>
                    <div className="btn">
                        <Button
                            type="primary"
                            icon="interaction"
                            size={config.max <= 2 ? 'large' : 'default'}
                            onClick={() => {
                                caseStore.remove(this.props.piSerialNumber! + this.props.piLocationID);
                                this.props.collectHandle(this.props);
                            }}>
                            重新取证
                        </Button>
                    </div>
                </div>
            </div>
        </div>;
    }
    /**
     * 渲染案件信息
     * @param data 组件属性
     */
    renderCaseInfo(data: Prop): JSX.Element | null {
        const { piSerialNumber, piLocationID } = data;
        if ((data.status === PhoneInfoStatus.FETCHING ||
            data.status === PhoneInfoStatus.FETCHEND) &&
            caseStore.exist(piSerialNumber! + piLocationID)) {
            let caseSession = caseStore.get(piSerialNumber! + piLocationID);
            const { m_strCaseName, m_strClientName, m_strDeviceHolder, m_strDeviceNumber } = caseSession;
            let match: RegExpMatchArray = [];
            if (!helper.isNullOrUndefined(m_strCaseName)) {
                match = m_strCaseName!.match(LeftUnderline) as RegExpMatchArray;
            }
            return <List size={config.max <= 2 ? 'large' : 'small'} bordered={true} style={{ width: '100%' }}>
                <List.Item><label>案件名称</label><span>{match ? match[0] : ''}</span></List.Item>
                <List.Item><label>手机持有人</label><span>{m_strDeviceHolder || ''}</span></List.Item>
                {m_strDeviceNumber ? <List.Item><label>手机编号</label><span>{m_strDeviceNumber}</span></List.Item> : null}
                {m_strClientName ? <List.Item><label>送检单位</label><span>{m_strClientName}</span></List.Item> : null}
            </List>
        } else {
            return null;
        }
    }
    /**
     * 渲染正在连接的提示区
     * @param brandName 品牌名称
     */
    renderDisconnectedInfo(systemType: SystemType) {
        if (systemType === SystemType.IOS) {
            return <>
                <span>请信任此电脑</span>
                <a onClick={() => this.props.usbDebugHandle!(SystemType.IOS)}>
                    如何操作？</a>
            </>;
        } else {
            return <>
                <span>请打开USB调试</span>
                <a onClick={() => this.props.usbDebugHandle!(SystemType.ANDROID)}>
                    如何打开？</a>
            </>;
        }
    }
    /**
     * 根据连接状态渲染组件
     * @param {PhoneInfoStatus} status 组件状态（枚举值）
     */
    renderByStatus(status: PhoneInfoStatus): JSX.Element {
        switch (status) {
            case PhoneInfoStatus.WAITING:
                //监听中
                return this.getDomByWaiting();
            case PhoneInfoStatus.NOT_CONNECT:
                //已识别，但未连接上采集程序
                return this.getDomByNotConnect();
            case PhoneInfoStatus.HAS_CONNECT:
                //已连接，可进行采集
                return this.getDomByHasConnect();
            case PhoneInfoStatus.FETCHING:
            case PhoneInfoStatus.FETCH_DOWNGRADING:
            case PhoneInfoStatus.FETCH_DOWNGRADING_END:
                //采集中
                return this.getDomByFetching();
            case PhoneInfoStatus.FETCHEND:
                //采集结束
                return this.getDomByFetchEnd();
            default:
                return this.getDomByWaiting();
        }
    }
    render(): JSX.Element {
        return <div className={config.max <= 2 ? 'widget-phone-info-pad' : 'widget-phone-info'}>
            {this.renderByStatus(this.props.status)}
        </div>;
    }
}

export default PhoneInfo;