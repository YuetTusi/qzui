import React, { Component, ReactElement } from 'react';
import { connect } from 'dva';
import { routerRedux } from 'dva/router';
import { IObject, IComponent } from '@src/type/model';
import Title from '@src/components/title/Title';
import './Friends.less';

interface IProp extends IComponent { }

/**
 * @description 好友
 */
class Friends extends Component<IProp> {
    constructor(props: IProp) {
        super(props);
    }
    render(): ReactElement {
        return <div className="friends-panel">
            <Title returnText="返回"
                onReturn={() => this.props.dispatch(routerRedux.push('/record/case-info'))}>
                好友
            </Title>
            <div className="friends">
                <div className="left">
                    <ul>
                        <li>
                            <div className="rec selected">
                                杨明
                            </div>
                        </li>
                        <li>
                            <div className="rec">
                                刘铮
                            </div>
                        </li>
                        <li>
                            <div className="rec">
                                王丽
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
                            <span>ID</span>
                            <span>13901111111</span>
                        </div>
                        <div className="no">
                            <span>帐号</span>
                            <span>13901111111</span>
                        </div>
                        <div className="no">
                            <span>昵称</span>
                            <span>Doni</span>
                        </div>
                        <div className="no">
                            <span>备注</span>
                            <span>...</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    }
}
export default connect((state: IObject) => ({ state }))(Friends);