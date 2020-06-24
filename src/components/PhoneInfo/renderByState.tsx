import React from 'react';
import classnames from 'classnames';
import Button from 'antd/lib/button';
import Icon from 'antd/lib/icon';
import { helper } from '@utils/helper';
import SystemType from '@src/schema/SystemType';
import { stPhoneInfoPara } from '@src/schema/stPhoneInfoPara';

const config = helper.readConf();

/**
 * 等待状态vDOM
 */
const getDomByWaiting = (context: any): JSX.Element => {
    context.resetClock(context.props.index);
    return <div className="connecting">
        <div className="info">请连接USB</div>
        <div className="lstatus">
            <Icon type="usb" />
        </div>
    </div>;
};

/**
 * 未连接状态vDOM
 */
const getDomByNotConnect = (context: any): JSX.Element => {
    const { piSystemType } = context.props;
    context.resetClock(context.props.index);
    return <div className="connected">
        <div className="img">
            <div className="title">正在连接...</div>
            <i className={classnames('phone-type', {
                large: config.max <= 2
            }, {
                iphone: context.props.piSystemType === SystemType.IOS
            }, {
                android: context.props.piSystemType === SystemType.ANDROID
            })}></i>
        </div>
        <div className="details">
            <div className="mark">
                <i className={`brand ${config.max <= 2 ? 'large' : ''} ${(context.props.piMakerName as string).toLowerCase()}`}></i>
                <div className="dt">
                    <div><label>品牌:</label><span>{context.props.piMakerName}</span></div>
                    <div><label>型号:</label><span>{context.props.piModel}</span></div>
                </div>
            </div>
            <div className="case-data">
                {context.renderDisconnectedInfo(piSystemType!)}
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
 * 正在检测连接状态DOM
 */
const getDomByCheckState = (context: any): JSX.Element => {
    // const { piSystemType } = context.props;
    context.resetClock(context.props.index);
    return <div className="connected">
        <div className="img">
            <div className="title">
                <div>
                    正在检测
                </div>
                <div>
                    连接状态
                </div>
            </div>
            <i className={classnames('phone-type', {
                large: config.max <= 2
            }, {
                iphone: context.props.piSystemType === SystemType.IOS
            }, {
                android: context.props.piSystemType === SystemType.ANDROID
            })}></i>
        </div>
        <div className="details">
            <div className="mark">
                <i className={`brand ${config.max <= 2 ? 'large' : ''} ${(context.props.piMakerName as string).toLowerCase()}`}></i>
                <div className="dt">
                    <div><label>品牌:</label><span>{context.props.piMakerName}</span></div>
                    <div><label>型号:</label><span>{context.props.piModel}</span></div>
                </div>
            </div>
            <div className="case-data">
                <div>
                    安卓手机请确认已开启USB调试, 并且是<em>文件传输模式</em>
                </div>
                <div>
                    苹果手机请确认已<em>信任</em>
                </div>
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
const getDomByHasConnect = (context: any): JSX.Element => {
    context.resetClock(context.props.index);
    return <div className="connected">
        <div className="img">
            <div className="title">已连接</div>
            <i className={classnames('phone-type', {
                large: config.max <= 2
            }, {
                iphone: context.props.piSystemType === SystemType.IOS
            }, {
                android: context.props.piSystemType === SystemType.ANDROID
            })}>
            </i>
        </div>
        <div className="details">
            <div className="mark">
                <i
                    title={`系统版本号：${context.props.piAndroidVersion}\n设备序列号：${context.props.piSerialNumber}\nUSB端口号：${context.props.piLocationID}`}
                    className={`brand ${config.max <= 2 ? 'large' : ''} ${(context.props.piMakerName as string).toLowerCase()}`} />
                <div className="dt">
                    <div><label>品牌:</label><span>{context.props.piMakerName}</span></div>
                    <div><label>型号:</label><span>{context.props.piModel}</span></div>
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
                    disabled={context.props.init.hasFetching}
                    onClick={() => context.props.collectHandle(context.props)}>
                    取证
                    </Button>
            </div>
        </div>
    </div>;
};

/**
 * 采集中状态vDOM
 */
const getDomByFetching = (context: any): JSX.Element => {
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
                    iphone: context.props.piSystemType === SystemType.IOS
                }, {
                    android: context.props.piSystemType === SystemType.ANDROID
                })}>
                    {context.renderClock()}
                </i>
            </div>
            <div className="details">
                <div className="outer-box">
                    <div className="mark">
                        <i className={`brand ${config.max <= 2 ? 'large' : ''} ${(context.props.piMakerName as string).toLowerCase()}`} />
                        <div className="dt">
                            <div><label>品牌:</label><span>{context.props.piMakerName}</span></div>
                            <div><label>型号:</label><span>{context.props.piModel}</span></div>
                        </div>
                    </div>
                    <div className="case-info">
                        {context.renderCaseInfo(context.props)}
                    </div>
                    <div className="btn">
                        <Button
                            type="primary"
                            size={config.max <= 2 ? 'large' : 'default'}
                            onClick={() => context.props.detailHandle(context.props as stPhoneInfoPara)}>
                            <Icon type="sync" spin={true} />
                            <span>详情</span>
                        </Button>
                        <Button
                            type="primary"
                            size={config.max <= 2 ? 'large' : 'default'}
                            disabled={(context.props as any).isStopping}
                            onClick={() => context.props.stopHandle(context.props as stPhoneInfoPara)
                            }>
                            <Icon type="stop" />
                            <span>{(context.props as any).isStopping ? '停止中' : '停止'}</span>
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    </div>;
};

/**
 * 采集完成状态vDOM
 */
const getDomByFetchEnd = (context: any): JSX.Element => {
    context.resetClock(context.props.index);
    return <div className="fetching">
        <div className="phone-info">
            <div className="img">
                <div className="title">取证完成</div>
                <i className={classnames('phone-type', {
                    large: config.max <= 2
                }, {
                    iphone: context.props.piSystemType === SystemType.IOS
                }, {
                    android: context.props.piSystemType === SystemType.ANDROID
                })}></i>
            </div>
            <div className="details">
                <div className="outer-box">
                    <div className="mark">
                        <i className={`brand ${config.max <= 2 ? 'large' : ''} ${(context.props.piMakerName as string).toLowerCase()}`}></i>
                        <div className="dt">
                            <div><label>品牌:</label><span>{context.props.piMakerName}</span></div>
                            <div><label>型号:</label><span>{context.props.piModel}</span></div>
                        </div>
                    </div>
                    <div className="case-info">
                        {context.renderCaseInfo(context.props)}
                    </div>
                </div>
                <div className="btn">
                    <Button
                        type="primary"
                        icon="interaction"
                        disabled={context.props.init.hasFetching}
                        size={config.max <= 2 ? 'large' : 'default'}
                        onClick={() => {
                            context.props.collectHandle(context.props);
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
    getDomByCheckState,
    getDomByNotConnect,
    getDomByHasConnect,
    getDomByFetching,
    getDomByFetchEnd
};