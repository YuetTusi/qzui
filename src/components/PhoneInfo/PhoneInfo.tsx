import React, { Component } from 'react';
import moment, { Moment } from 'moment';
import Icon from 'antd/lib/icon';
import Button from 'antd/lib/button';
import List from 'antd/lib/list';
import { PhoneInfoStatus } from './PhoneInfoStatus';
import { stPhoneInfoPara } from '@src/schema/stPhoneInfoPara';
import SystemType from '@src/schema/SystemType';
import { LeftUnderline } from '@utils/regex';
import { helper } from '@src/utils/helper';
import config from '@src/config/ui.config.json';
import { caseStore } from '@src/utils/sessionStore';
import './PhoneInfo.less';

let clockInitVal: string[] = []; //时钟初始值

for (let i = 0; i < config.max; i++) {
    clockInitVal.push('00:00:00');
}

interface IProp extends stPhoneInfoPara {
    /**
     * 组件索引
     */
    index: number;
    /**
     * 采集状态
     */
    status: PhoneInfoStatus;
    /**
     * 打开USB调试链接回调
     */
    usbDebugHandle?: (arg0: string) => void;
    /**
     * 采集回调方法
     */
    collectHandle: (arg0: any) => void;
    /**
     * 详情回调方法
     */
    detailHandle: (arg0: stPhoneInfoPara) => void;
    /**
     * 停止采集回调方法
     */
    stopHandle: (arg0: stPhoneInfoPara) => void;
}

interface IState {
    /**
     * 当前组件时钟
     */
    clock: string;
};

/**
 * 手机连接信息组件
 */
class PhoneInfo extends Component<IProp, IState>{
    timer: number | null;
    constructor(props: IProp) {
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
    componentWillReceiveProps(nextProps: IProp) {
        if (nextProps.status !== PhoneInfoStatus.FETCHING && this.timer !== null) {
            clearInterval(this.timer!);
        }
    }
    shouldComponentUpdate(nextProps: IProp, nextState: IState) {
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
     * 渲染案件信息
     * @param data 组件属性
     */
    renderCaseInfo(data: IProp): JSX.Element | null {
        const { piSerialNumber, piLocationID } = data;
        if (data.status === PhoneInfoStatus.FETCHING && caseStore.exist(piSerialNumber! + piLocationID)) {
            const { m_strCaseName, m_strClientName, m_strDeviceHolder, m_strDeviceNumber } = caseStore.get(piSerialNumber! + piLocationID);
            let match: RegExpMatchArray = [];
            if (!helper.isNullOrUndefined(m_strCaseName)) {
                match = m_strCaseName!.match(LeftUnderline) as RegExpMatchArray;
            }
            return <List size="small" bordered={true} style={{ width: '100%' }}>
                <List.Item><label>所属案件</label><span>{match ? match[0] : ''}</span></List.Item>
                <List.Item><label>手机持有人</label><span>{m_strDeviceHolder || ''}</span></List.Item>
                {m_strDeviceNumber ? <List.Item><label>检材编号</label><span>{m_strDeviceNumber}</span></List.Item> : null}
                {m_strClientName ? <List.Item><label>送检单位</label><span>{m_strClientName}</span></List.Item> : null}
            </List>
        } else {
            return null;
        }
    }
    /**
     * 根据连接状态渲染组件
     * @param {PhoneInfoStatus} status 组件状态（枚举值）
     */
    renderByStatus(status: PhoneInfoStatus): JSX.Element {
        switch (status) {
            case PhoneInfoStatus.WAITING:
                //连接中
                this.resetClock(this.props.index);
                return <div className="connecting">
                    <div className="info">请连接USB</div>
                    <div className="lstatus">
                        <Icon type="loading" />
                    </div>
                </div>;
            case PhoneInfoStatus.NOT_CONNECT:
                //已识别，但未连接上采集程序
                this.resetClock(this.props.index);
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
                            <Button type="primary" icon="interaction" disabled={true} size="default">取证</Button>
                        </div>
                    </div>
                </div>;
            case PhoneInfoStatus.HAS_CONNECT:
                //已连接，可进行采集
                this.resetClock(this.props.index);
                return <div className="connected">
                    <div className="img">
                        <div className="title">已连接</div>
                        <i className={`phone-type ${this.props.piSystemType === SystemType.IOS ? 'iphone' : 'android'}`}>
                        </i>
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
                                size="default"
                                onClick={() => this.props.collectHandle(this.props)}>
                                取证
                            </Button>
                        </div>
                    </div>
                </div>;
            case PhoneInfoStatus.FETCHING:
            case PhoneInfoStatus.FETCH_DOWNGRADING:
            case PhoneInfoStatus.FETCH_DOWNGRADING_END:
                //采集中
                return <div className="fetching">
                    <div className="progress"></div>
                    <div className="case-info">
                        {this.renderCaseInfo(this.props)}
                    </div>
                    <div className="phone-info">
                        <div className="img">
                            <div className="title">正在取证...</div>
                            <i className={`phone-type ${this.props.piSystemType === SystemType.IOS ? 'iphone' : 'android'}`}>
                                {this.renderClock()}
                            </i>
                        </div>
                        <div className="details">
                            <div className="mark">
                                <i className={`brand ${(this.props.piMakerName as string).toLowerCase()}`} />
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
                                    size="default"
                                    onClick={() => this.props.detailHandle(this.props as stPhoneInfoPara)}>
                                    <Icon type="sync" spin={true} />
                                    <span>详情</span>
                                </Button>
                                <Button
                                    type="primary"
                                    size="default"
                                    onClick={() => {
                                        this.props.stopHandle(this.props as stPhoneInfoPara);
                                    }
                                    }>
                                    <Icon type="stop" />
                                    <span>停止</span>
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>;
            case PhoneInfoStatus.FETCHEND:
                //采集结束
                this.resetClock(this.props.index);
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
                                size="default"
                                onClick={() => this.props.collectHandle(this.props)}>
                                取证
                            </Button>
                        </div>
                    </div>
                </div>;
            default:
                this.resetClock(this.props.index);
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