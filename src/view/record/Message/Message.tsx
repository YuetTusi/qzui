import React, { Component, ReactElement } from 'react';
import { connect } from 'dva';
import { routerRedux } from 'dva/router';
import { IComponent, IObject } from '@type/model';
import Title from '@src/components/title/Title';
import './Message.less';

interface IProp extends IComponent { }

class Message extends Component<IProp> {
    constructor(props: any) {
        super(props);
    }
    render(): ReactElement {
        return <div className="message-panel">
            <Title returnText="返回" onReturn={() => this.props.dispatch(routerRedux.push('/record/case-info'))}>
                短信
            </Title>
            <div className="message-container">
                <div className="left">
                    <ul>
                        <li>
                            <div className="one-msg selected">
                                <div className="avatar">
                                    <i>头像</i>
                                </div>
                                <div className="txt">
                                    <div className="td">
                                        <div className="title">400-606-12345</div>
                                        <div className="date">2019-08-12 12:22:36</div>
                                    </div>
                                    <div className="preview">
                                        短信预览内容，短信预览内容，短信预览内容，短信预览内容，短信预览内容，短信预览内容，短信预览内容，短信预览内容
                                        短信预览内容，短信预览内容，短信预览内容，短信预览内容，短信预览内容，短信预览内容，短信预览内容，短信预览内容
                                    </div>
                                </div>
                            </div>
                        </li>
                        <li>
                            <div className="one-msg">
                                <div className="avatar">
                                    <i>头像</i>
                                </div>
                                <div className="txt">
                                    <div className="td">
                                        <div className="title">400-606-12345</div>
                                        <div className="date">2019-08-12 12:22:36</div>
                                    </div>
                                    <div className="preview">
                                        短信预览内容，短信预览内容，短信预览内容，短信预览内容，短信预览内容，短信预览内容，短信预览内容，短信预览内容
                                        短信预览内容，短信预览内容，短信预览内容，短信预览内容，短信预览内容，短信预览内容，短信预览内容，短信预览内容
                                    </div>
                                </div>
                            </div>
                        </li>
                    </ul>
                </div>
                <div className="right">
                    <div className="one-detail">
                        <time>2019-08-10 12:00:00</time>
                        <div className="detail">
                            【省呗】信用卡额度+2万，代还5000，月利息仅29元，手机即可申请！帮你一次还清信用卡！点击t.cn/RcxB8RD 了解省呗！回TD退订
                        </div>
                    </div>
                    <div className="one-detail">
                        <time>2019-08-10 12:00:00</time>
                        <div className="detail">
                            【省呗】信用卡额度+2万，代还5000，月利息仅29元，手机即可申请！帮你一次还清信用卡！点击t.cn/RcxB8RD 了解省呗！回TD退订
                        </div>
                    </div>
                    <div className="one-detail">
                        <time>2019-08-10 12:00:00</time>
                        <div className="detail">
                            【省呗】信用卡额度+2万，代还5000，月利息仅29元，手机即可申请！帮你一次还清信用卡！点击t.cn/RcxB8RD 了解省呗！回TD退订
                        </div>
                    </div>
                </div>
            </div>
        </div>
    }
}
export default connect((state: IObject) => ({ state }))(Message);