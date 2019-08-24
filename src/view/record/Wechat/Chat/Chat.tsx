import React, { Component, ReactElement } from 'react';
import { connect } from 'dva';
import { routerRedux } from 'dva/router';
import { IObject, IComponent } from '@src/type/model';
import Title from '@src/components/title/Title';
import './Chat.less';

interface IProp extends IComponent { }

/**
 * @description 聊天
 */
class Chat extends Component<IProp> {
    constructor(props: IProp) {
        super(props);
    }
    render(): ReactElement {
        return <div className="chat-panel">
            <Title returnText="返回"
                onReturn={() => this.props.dispatch(routerRedux.push('/record/case-info'))}>
                聊天
            </Title>
            <div className="chat-container">
                <div className="left">
                    <ul>
                        <li>
                            <div className="one-msg selected">
                                <div className="avatar">
                                    <i>头像</i>
                                </div>
                                <div className="txt">
                                    <div className="td">
                                        <div className="title">未知ID</div>
                                        <div className="date">2019-08-12 12:22:36</div>
                                    </div>
                                    <div className="preview">
                                        聊天预览内容，聊天预览内容，聊天预览内容，聊天预览内容，聊天预览内容
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
                                        <div className="title">未知ID</div>
                                        <div className="date">2019-08-12 12:22:36</div>
                                    </div>
                                    <div className="preview">
                                        聊天预览内容，聊天预览内容，聊天预览内容，聊天预览内容，聊天预览内容
                                    </div>
                                </div>
                            </div>
                        </li>
                    </ul>
                </div>
                <div className="right">
                    <div className="one-detail">
                        <time>2019-08-10 12:00:00</time>
                        <div className="reply">
                            回复内容
                        </div>
                        <time>2019-08-10 12:00:00</time>
                        <div className="reply">
                            回复内容
                        </div>
                        <time>2019-08-10 12:00:00</time>
                        <div className="reply">
                            回复内容
                        </div>
                        <div className="send">
                            发送内容
                        </div>
                        <div className="send">
                            发送内容
                        </div>
                        <div className="reply">
                            回复内容
                        </div>
                    </div>
                </div>
            </div>
        </div>;
    }
}
export default connect((state: IObject) => ({ state }))(Chat);