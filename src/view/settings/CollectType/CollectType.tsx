import React, { Component, ReactElement } from 'react';
import Title from '@src/components/title/Title';
import AppList from '@src/components/AppList/AppList';
import { apps } from '@src/config/view.config';
import './CollectType.less';

/**
 * @description 采集类型
 */
class CollectType extends Component {
    constructor(props: any) {
        super(props);
    }
    //选中AppList组件图标会激发此方法
    selectHandle(selected: Array<any>) {
    }
    render(): ReactElement {
        return <div className="collect-type">
            <Title returnText="返回">采集类型</Title>
            <div className="apps-panel">
                <AppList apps={apps.fetch} selectHandle={this.selectHandle} />
            </div>
        </div>
    }
}
export default CollectType; 