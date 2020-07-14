import React from 'react';
import classnames from 'classnames';
import Button from 'antd/lib/button';
import List from 'antd/lib/list';
import Icon from 'antd/lib/icon';
import Modal from 'antd/lib/modal';
import PhoneSystem from '@src/schema/socket/PhoneSystem';
import { helper } from '@utils/helper';
import { Prop } from './ComponentType';
import Clock from '@src/components/Clock/Clock';
import { caseStore } from '@src/utils/localStore';
import { LeftUnderline } from '@src/utils/regex';

const config = helper.readConf();

/**
 * 渲染案件信息
 * @param data 组件属性
 */
const renderCaseInfo = (data: Prop): JSX.Element | null => {
    const { usb } = data;
    if (caseStore.exist(usb!)) {
        let caseSession = caseStore.get(usb!);
        const { caseName, mobileHolder, mobileNo } = caseSession;
        let match: RegExpMatchArray = [];
        if (!helper.isNullOrUndefined(caseName)) {
            match = caseName!.match(LeftUnderline) as RegExpMatchArray;
        }
        return <List
            size={config.max <= 2 ? 'large' : 'small'}
            bordered={true}
            style={{ width: '100%' }}>
            <List.Item>
                <div className="list-item-row">
                    <label>案件名称</label>
                    <span>{match ? match[0] : ''}</span>
                </div>
            </List.Item>
            <List.Item>
                <div className="list-item-row">
                    <label>手机持有人</label>
                    <span>{mobileHolder || ''}</span>
                </div>
            </List.Item>
            {mobileNo
                ? <List.Item>
                    <div className="list-item-row">
                        <label>手机编号</label>
                        <span>{mobileNo}</span>
                    </div>
                </List.Item>
                : null}
        </List>
    } else {
        return null;
    }
}

/**
 * 等待状态
 */
const getDomByWaiting = (props: Prop): JSX.Element => {
    //context.resetClock(props.usb);
    return <div className="connecting">
        <div className="info">请连接USB</div>
        <div className="lstatus">
            <Icon type="usb" />
        </div>
    </div>;
};

/**
 * 未连接状态
 */
const getDomByNotConnect = (props: Prop): JSX.Element => {
    const { system } = props;
    // context.resetClock(context.props.index);
    return <div className="connected">
        <div className="img">
            <div className="title">正在连接...</div>
            <i className={classnames('phone-type', {
                large: config.max <= 2
            }, {
                iphone: system === PhoneSystem.IOS
            }, {
                android: system === PhoneSystem.Android
            })}></i>
        </div>
        <div className="details">
            <div className="mark">
                <i className={`brand ${config.max <= 2 ? 'large' : ''} ${props.brand!.toLowerCase()}`}></i>
                <div className="dt">
                    <div><label>品牌:</label><span>{props.brand}</span></div>
                    <div><label>型号:</label><span>{props.model}</span></div>
                </div>
            </div>
            <div className="case-data">
                {
                    system === PhoneSystem.Android
                        ? <div>
                            请确认已开启<em>USB调试</em>，且是<em>文件传输模式</em>
                        </div>
                        : <div>
                            请在设备上点击<em>信任</em>此电脑
                        </div>
                }
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
};

/**
 * 已连接状态
 */
const getDomByHasConnect = (props: Prop): JSX.Element => {
    // context.resetClock(context.props.index);
    const { system } = props;
    return <div className="connected">
        <div className="img">
            <div className="title">已连接</div>
            <i className={classnames('phone-type', {
                large: config.max <= 2
            }, {
                iphone: system === PhoneSystem.IOS
            }, {
                android: system === PhoneSystem.Android
            })}></i>
        </div>
        <div className="details">
            <div className="mark">
                <i
                    className={`brand ${config.max <= 2 ? 'large' : ''} ${props.brand!.toLowerCase()}`} />
                <div className="dt">
                    <div><label>品牌:</label><span>{props.brand}</span></div>
                    <div><label>型号:</label><span>{props.model}</span></div>
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
                    // disabled={context.props.init.hasFetching}
                    onClick={() => props.collectHandle(props)}>
                    取证
                    </Button>
            </div>
        </div>
    </div>;
};

/**
 * 采集中状态
 */
const getDomByFetching = (props: Prop): JSX.Element => {
    const { system } = props;
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
                    iphone: system === PhoneSystem.IOS
                }, {
                    android: system === PhoneSystem.Android
                })}>
                    <Clock usb={Number(props.usb) - 1} system={props.system!} />
                </i>
            </div>
            <div className="details">
                <div className="outer-box">
                    <div className="mark">
                        <i className={`brand ${config.max <= 2 ? 'large' : ''} ${props.brand!.toLowerCase()}`} />
                        <div className="dt">
                            <div><label>品牌:</label><span>{props.brand}</span></div>
                            <div><label>型号:</label><span>{props.model}</span></div>
                        </div>
                    </div>
                    <div className="case-info">
                        {renderCaseInfo(props)}
                    </div>
                    <div className="btn">
                        <Button
                            type="primary"
                            size={config.max <= 2 ? 'large' : 'default'}
                            onClick={() => {
                                Modal.confirm({
                                    title: '停止',
                                    content: '确定停止取证？',
                                    okText: '是',
                                    cancelText: '否',
                                    onOk() {
                                        props.stopHandle(props);
                                    }
                                });

                            }}>
                            <Icon type="stop" />
                            <span>停止</span>
                        </Button>
                    </div>
                    <div className="current-msg">
                        正在拉取com.tt.wx.com，总进度90% 正在拉取com.tt.wx.com，总进度90% 正在拉取com.tt.wx.com，总进度90%
                    </div>
                </div>
            </div>
        </div>
    </div>;
};

/**
 * 采集完成状态
 */
const getDomByFetchEnd = (props: Prop): JSX.Element => {
    // context.resetClock(context.props.index);
    const { system } = props;
    return <div className="fetching">
        <div className="phone-info">
            <div className="img">
                <div className="title">已连接</div>
                <i className={classnames('phone-type', {
                    large: config.max <= 2
                }, {
                    iphone: system === PhoneSystem.IOS
                }, {
                    android: system === PhoneSystem.Android
                })}>
                    <Clock usb={Number(props.usb) - 1} system={props.system!} />
                </i>
            </div>
            <div className="details">
                <div className="outer-box">
                    <div className="mark">
                        <i className={`brand ${config.max <= 2 ? 'large' : ''} ${props.brand!.toLowerCase()}`}></i>
                        <div className="dt">
                            <div><label>品牌:</label><span>{props.brand}</span></div>
                            <div><label>型号:</label><span>{props.model}</span></div>
                        </div>
                    </div>
                    <div className="case-info">
                        {renderCaseInfo(props)}
                    </div>
                </div>
                <div className="btn">
                    <Button
                        type="primary"
                        icon="interaction"
                        // disabled={context.props.init.hasFetching}
                        size={config.max <= 2 ? 'large' : 'default'}
                        onClick={() => {
                            props.collectHandle(props);
                        }}>
                        取证
                        </Button>
                </div>
            </div>
        </div>
    </div>;
};

/**
 * 采集有误状态
 */
const getDomByHasError = (props: Prop): JSX.Element => {
    // context.resetClock(context.props.index);
    const { system } = props;
    return <div className="fetching">
        <div className="phone-info">
            <div className="img">
                <div className="title warning">取证异常</div>
                <i className={classnames('phone-type', {
                    large: config.max <= 2
                }, {
                    iphone: system === PhoneSystem.IOS
                }, {
                    android: system === PhoneSystem.Android
                })}>
                    <Clock usb={Number(props.usb) - 1} system={props.system!} />
                </i>
            </div>
            <div className="details">
                <div className="outer-box">
                    <div className="mark">
                        <i className={`brand ${config.max <= 2 ? 'large' : ''} ${props.brand!.toLowerCase()}`}></i>
                        <div className="dt">
                            <div><label>品牌:</label><span>{props.brand}</span></div>
                            <div><label>型号:</label><span>{props.model}</span></div>
                        </div>
                    </div>
                    <div className="case-info">
                        {renderCaseInfo(props)}
                    </div>
                </div>
                <div className="btn">
                    <Button
                        type="primary"
                        icon="interaction"
                        size={config.max <= 2 ? 'large' : 'default'}
                        onClick={() => {
                            props.collectHandle(props);
                        }}>
                        取证
                        </Button>
                    <Button
                        type="primary"
                        icon="exception"
                        size={config.max <= 2 ? 'large' : 'default'}
                        onClick={() => {
                            props.errorHandle(props);
                        }}>
                        记录
                        </Button>
                </div>
            </div>
        </div>
    </div>;
};

export {
    getDomByWaiting,
    getDomByNotConnect,
    getDomByHasConnect,
    getDomByFetching,
    getDomByFetchEnd,
    getDomByHasError
};