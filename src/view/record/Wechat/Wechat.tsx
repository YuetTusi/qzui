import React, { Component, ReactElement } from 'react';
import { connect } from 'dva';
import { Route, Link } from 'dva/router';
import { IObject, IComponent } from '@src/type/model';
import UserDetail from './UserDetail/UserDetail';
import Chat from './Chat/Chat';
import Friends from './Friends/Friends';
import Dynamic from './Dynamic/Dynamic';

interface IProp extends IComponent { }
import './Wechat.less';

/**
 * @description 微信详情（首页）
 */
class Wechat extends Component<IProp> {
    constructor(props: IProp) {
        super(props);
    }
    render(): ReactElement {
        return <div className="wechat-panel">
            <div className="opt-list">
                <ul>
                    <li>
                        <Link to="/record/wechat" replace={true}>
                            <i className="account"></i>
                            <div className="txt">
                                <span className="black">昵称</span>
                                <span className="gray">微信号</span>
                            </div>
                        </Link>
                    </li>
                    <li>
                        <Link to="/record/wechat/chat" replace={true}>
                            <i className="chats"></i>
                            <div className="txt">
                                <span>聊天</span>
                                <span>消息12345 / <strong>删除123</strong></span>
                            </div>
                        </Link>
                    </li>
                    <li>
                        <Link to="/record/wechat/friends" replace={true}>
                            <i className="friends"></i>
                            <div className="txt">
                                <span>好友</span>
                                <span>消息12345 / <strong>删除123</strong></span>
                            </div>
                        </Link>
                    </li>
                    <li>
                        <Link to="/record/wechat/group" replace={true}>
                            <i className="group"></i>
                            <div className="txt">
                                <span>群组</span>
                                <span>消息12345 / <strong>删除123</strong></span>
                            </div>
                        </Link>
                    </li>
                    <li>
                        <Link to="/record/wechat/dynamic" replace={true}>
                            <i className="dynamic"></i>
                            <div className="txt">
                                <span>动态</span>
                                <span>消息12345 / <strong>删除123</strong></span>
                            </div>
                        </Link>
                    </li>
                    <li>
                        <Link to="/record/wechat/mini-program" replace={true}>
                            <i className="mini-program"></i>
                            <div className="txt">
                                <span>小程序</span>
                                <span>消息12345 / <strong>删除123</strong></span>
                            </div>
                        </Link>
                    </li>
                    <li>
                        <Link to="/record/wechat/favorite" replace={true}>
                            <i className="favorite"></i>
                            <div className="txt">
                                <span>收藏</span>
                                <span>消息12345 / <strong>删除123</strong></span>
                            </div>
                        </Link>
                    </li>
                    <li>
                        <Link to="/record/wechat/bind-info" replace={true}>
                            <i className="bind"></i>
                            <div className="txt">
                                <span>绑定信息</span>
                                <span>消息12345 / <strong>删除123</strong></span>
                            </div>
                        </Link>
                    </li>
                    <li>
                        <Link to="/record/wechat/search" replace={true}>
                            <i className="search"></i>
                            <div className="txt">
                                <span>搜索记录</span>
                            </div>
                        </Link>
                    </li>

                </ul>
            </div>
            <div className="opt-container">
                <Route path="/record/wechat" exact={true} component={UserDetail} />
                <Route path="/record/wechat/chat" component={Chat} />
                <Route path="/record/wechat/friends" component={Friends} />
                <Route path="/record/wechat/dynamic" component={Dynamic} />
            </div>
        </div>
    }
}
export default connect((state: IObject) => ({ state }))(Wechat);