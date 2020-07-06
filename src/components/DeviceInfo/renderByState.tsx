import React from 'react';
import classnames from 'classnames';
import Button from 'antd/lib/button';
import Icon from 'antd/lib/icon';
import { helper } from '@utils/helper';
import { Prop } from './ComponentType';
import Clock from '@src/components/Clock/Clock';

const config = helper.readConf();

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
                iphone: system === 'ios'
            }, {
                android: system === 'android'
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
                    system === 'android'
                        ? <div>
                            请确认已开启<em>USB调试</em>, 且是<em>文件传输模式</em>
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
                iphone: system === 'ios'
            }, {
                android: system === 'android'
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
                    iphone: system === 'ios'
                }, {
                    android: system === 'android'
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
                        {/* {context.renderCaseInfo(context.props)} */}
                    </div>
                    <div className="btn">
                        <Button
                            type="primary"
                            size={config.max <= 2 ? 'large' : 'default'}
                            // disabled={(context.props as any).isStopping}
                            onClick={() => props.stopHandle(props)
                            }>
                            <Icon type="stop" />
                            <span>{(props as any).isStopping ? '停止中' : '停止'}</span>
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
                <div className="title">取证完成</div>
                <i className={classnames('phone-type', {
                    large: config.max <= 2
                }, {
                    iphone: system === 'ios'
                }, {
                    android: system === 'android'
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
                        {/* {context.renderCaseInfo(context.props)} */}
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
                        重新取证
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
    getDomByFetchEnd
};