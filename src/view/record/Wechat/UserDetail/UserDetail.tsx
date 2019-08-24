import React, { Component, ReactElement } from 'react';
import { connect } from 'dva';
import { routerRedux } from 'dva/router';
import { IObject, IComponent } from '@src/type/model';
import Title from '@src/components/title/Title';
import './UserDetail.less';

interface IProp extends IComponent { }

/**
 * @description 微信用户详情
 */
class UserDetail extends Component<IProp> {
    constructor(props: IProp) {
        super(props);
    }
    render(): ReactElement {
        return <div className="user-detail">
            <Title returnText="返回"
                onReturn={() => this.props.dispatch(routerRedux.push('/record/case-info'))}>
                用户详情
            </Title>
            <div className="info">
                <ul>
                    <li>
                        <label>ID</label>
                        <span>15601186776</span>
                    </li>
                    <li>
                        <label>帐号</label>
                        <span>zhangnan_123</span>
                    </li>
                    <li>
                        <label>昵称</label>
                        <span>Doni</span>
                    </li>
                    <li>
                        <label>密码</label>
                        <span>123123</span>
                    </li>
                    <li>
                        <label>性别</label>
                        <span>男</span>
                    </li>
                    <li>
                        <label>年龄</label>
                        <span>20</span>
                    </li>
                    <li>
                        <label>邮箱</label>
                        <span>zhangnan@163.com</span>
                    </li>
                    <li>
                        <label>签名</label>
                        <span></span>
                    </li>
                    <li>
                        <label>出生年月</label>
                        <span>2009年1月1日</span>
                    </li>
                </ul>
            </div>
        </div>;
    }
}
export default connect((state: IObject) => ({ state }))(UserDetail);