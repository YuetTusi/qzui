import React, { Component, ReactElement } from 'react';
import Title from '@src/components/title/Title';
import { IObject, IComponent } from '@type/model';
import { connect } from 'dva';
import { routerRedux } from 'dva/router';
import './CallLog.less';

interface IProp extends IComponent { }

/**
 * @description 通话记录
 */
class CallLog extends Component<IProp> {
    constructor(props: any) {
        super(props);
    }
    render(): ReactElement {
        return <div className="call-log">
            <Title returnText="返回" onReturn={() => this.props.dispatch(routerRedux.push('/record/case-info'))}>
                通话记录
            </Title>
            <div className="log-panel">
                <div className="left">
                    <ul>
                        <li>
                            <div className="rec">
                                <i className="inbound" title="已接"></i>
                                <div className="info">
                                    <div className="name">杨明</div>
                                    <div className="no">13901111111</div>
                                </div>
                                <time>2019-08-08 12:00:01</time>
                            </div>
                        </li>
                        <li>
                            <div className="rec">
                                <i className="no-answer" title="未接"></i>
                                <div className="info">
                                    <div className="name">刘铮</div>
                                    <div className="no">13601111111</div>
                                </div>
                                <time>2019-08-08 12:00:01</time>
                            </div>
                        </li>
                        <li>
                            <div className="rec">
                                <i className="outbound" title="呼出"></i>
                                <div className="info">
                                    <div>王丽</div>
                                    <div>18601111111</div>
                                </div>
                                <time>2019-08-08 12:00:01</time>
                            </div>
                        </li>
                    </ul>
                </div>
                <div className="right">
                    <div className="selected-log">
                        <div className="name">
                            <i className="avatar"></i>
                            <span>杨明</span>
                        </div>
                        <div className="no">
                            13901111111
                        </div>
                        <div className="list">
                            <ul>
                                <li>
                                    <span>接入（5分20秒）</span>
                                    <time>2019-05-01 19:11:09</time>
                                </li>
                                <li>
                                    <span>拨出（1分09秒）</span>
                                    <time>2019-05-01 19:11:09</time>
                                </li>
                                <li>
                                    <span>接入（5分20秒）</span>
                                    <time>2019-05-01 19:11:09</time>
                                </li>
                                <li>
                                    <span>拨出（1分09秒）</span>
                                    <time>2019-05-01 19:11:09</time>
                                </li>
                                <li>
                                    <span>接入（5分20秒）</span>
                                    <time>2019-05-01 19:11:09</time>
                                </li>
                                <li>
                                    <span>拨出（1分09秒）</span>
                                    <time>2019-05-01 19:11:09</time>
                                </li>
                                <li>
                                    <span>接入（5分20秒）</span>
                                    <time>2019-05-01 19:11:09</time>
                                </li>
                                <li>
                                    <span>拨出（1分09秒）</span>
                                    <time>2019-05-01 19:11:09</time>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    }
}
export default connect((state: IObject) => ({ state }))(CallLog);