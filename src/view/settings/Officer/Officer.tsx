import React, { Component, ReactElement } from 'react';
import { Icon } from 'antd';
import Title from '@src/components/title/Title';
import { connect } from 'dva';
import { routerRedux } from 'dva/router';
import { IComponent, IObject } from '@type/model';
import './Officer.less';

interface IProp extends IComponent { }

/**
 * @description 警员信息
 */
class Officer extends Component<IProp> {
    constructor(props: any) {
        super(props);
    }
    render(): ReactElement {
        return <div className="officer-panel">
            <Title okText="新增" onOk={() => this.props.dispatch(routerRedux.push('/settings/officer/edit/-1'))}>警员信息</Title>
            <div className="police-list">
                <ul>
                    <li>
                        <div className="police" onClick={() => this.props.dispatch(routerRedux.push('/settings/officer/edit/1001'))}>
                            <i className="avatar" title="头像"></i>
                            <div className="info">
                                <span>祁厅长</span>
                                <em>100556</em>
                            </div>
                            <div className="drop">
                                <Icon type="delete" style={{ fontSize: '22px' }} />
                            </div>
                        </div>
                    </li>
                    <li>
                        <div className="police">
                            <i className="avatar" title="头像"></i>
                            <div className="info">
                                <span>祁厅长</span>
                                <em>100556</em>
                            </div>
                            <div className="drop">
                                <Icon type="delete" style={{ fontSize: '22px' }} />
                            </div>
                        </div>
                    </li>
                    <li>
                        <div className="police">
                            <i className="avatar" title="头像"></i>
                            <div className="info">
                                <span>祁厅长</span>
                                <em>100556</em>
                            </div>
                            <div className="drop">
                                <Icon type="delete" style={{ fontSize: '22px' }} />
                            </div>
                        </div>
                    </li>
                    <li>
                        <div className="police">
                            <i className="avatar" title="头像"></i>
                            <div className="info">
                                <span>祁厅长</span>
                                <em>100556</em>
                            </div>
                            <div className="drop">
                                <Icon type="delete" style={{ fontSize: '22px' }} />
                            </div>
                        </div>
                    </li>
                </ul>
            </div>
        </div>
    }
}
export default connect((state: IObject) => ({ state }))(Officer);