import React, { Component } from 'react';
import moment from 'moment';
import List from 'antd/lib/list';
import { PhoneInfoStatus } from './PhoneInfoStatus';
import SystemType from '@src/schema/SystemType';
import { LeftUnderline } from '@utils/regex';
import { helper } from '@src/utils/helper';
import config from '@src/config/ui.yaml';
import { caseStore } from '@src/utils/localStore';
import { Prop, State } from './ComponentType';
import { getDomByWaiting, getDomByNotConnect, getDomByHasConnect, getDomByFetching, getDomByFetchEnd } from './renderByState';
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
                return getDomByWaiting(this);
            case PhoneInfoStatus.NOT_CONNECT:
                //已识别，但未连接上采集程序
                return getDomByNotConnect(this);
            case PhoneInfoStatus.HAS_CONNECT:
                //已连接，可进行采集
                return getDomByHasConnect(this);
            case PhoneInfoStatus.FETCHING:
            case PhoneInfoStatus.FETCH_DOWNGRADING:
            case PhoneInfoStatus.FETCH_DOWNGRADING_END:
                //采集中
                return getDomByFetching(this);
            case PhoneInfoStatus.FETCHEND:
                //采集结束
                return getDomByFetchEnd(this);
            default:
                return getDomByWaiting(this);
        }
    }
    render(): JSX.Element {
        return <div className={config.max <= 2 ? 'widget-phone-info-pad' : 'widget-phone-info'}>
            {this.renderByStatus(this.props.status)}
        </div>;
    }
}

export default PhoneInfo;