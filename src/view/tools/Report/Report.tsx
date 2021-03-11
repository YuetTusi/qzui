import React, { Component, ReactElement } from 'react';
import Title from '@src/components/title/Title';
import { StateTree, StoreComponent } from '@type/model';
import { connect } from 'dva';
import { routerRedux } from 'dva/router';
import './Report.less';

interface Prop extends StoreComponent { }

/**
 * @description 报告生成
 */
class Report extends Component<Prop> {
    constructor(props: Prop) {
        super(props);
    }
    render(): ReactElement {
        return <div className="bcp-upload">
            <Title returnText="返回" onReturn={() => this.props.dispatch(routerRedux.push('/tools'))}>报告生成</Title>
        </div>
    }
}
export default connect((state: StateTree) => ({ state }))(Report);