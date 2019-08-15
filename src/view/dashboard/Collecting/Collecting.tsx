import React, { Component, ReactElement } from 'react';
import './Collecting.less';
import { Button, Progress } from 'antd';
import AppList from '@src/components/AppList/AppList';
import { IComponent } from '@src/type/model';
import { apps } from '@src/config/view.config';

interface IProp extends IComponent { }

interface IState {
    //应用图标数据
    apps: Array<any>;
}

/**
 * @description 采集数据
 */
class Collection extends Component<IProp, IState> {
    //组件选中反馈的数据
    selectedApps: Array<any>;
    constructor(props: any) {
        super(props);
        this.state = {
            apps: apps.fetch
        }
        this.selectedApps = [];
    }
    render(): ReactElement {
        return <div className="collecting">
            <div className="header">
                <div className="phone">
                    <div className="iphone"></div>
                </div>
                <div className="info">
                    <div className="phone-info">
                        <i className="brand apple"></i>
                        <span>Apple iPhone 8 plus</span>
                    </div>
                    <div className="status">
                        正在拉取文件，已拉取文件数0
                    </div>
                </div>
                <div className="btn">
                    <Button type="primary">全选</Button>
                    <Button type="primary">开始采集</Button>
                    <Button type="primary">终止采集</Button>
                </div>
            </div>
            <div className="process">
                <Progress percent={30} />
            </div>
            <div className="app-panel">
                <AppList apps={this.state.apps} selectHandle={(data) => {
                    this.selectedApps = data;
                }} />
            </div>
        </div>
    }
}

export default Collection;