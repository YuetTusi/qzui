import React, { Component, ReactElement } from 'react';
import Title from '@src/components/title/Title';
import { IObject, IComponent } from '@type/model';
import { connect } from 'dva';
import { routerRedux } from 'dva/router';
import './Phonebook.less';

interface IProp extends IComponent { }

/**
 * @description 通讯录
 */
class Phonebook extends Component<IProp> {
    constructor(props: any) {
        super(props);
    }
    render(): ReactElement {
        return <div className="phonebook">
            <Title returnText="返回"
                onReturn={() => this.props.dispatch(routerRedux.push('/record/case-info'))}>
                通讯录
            </Title>
            <div className="book-panel">
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
                            <span>电话号码</span>
                            <span>13901111111</span>
                        </div>
                        <div className="no">
                            <span>电话号码</span>
                            <span>13901111111</span>
                        </div>
                        <div className="no">
                            <span>电话号码</span>
                            <span>13901111111</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    }
}

export default connect((state: IObject) => ({ state }))(Phonebook);