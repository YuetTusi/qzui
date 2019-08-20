import React, { Component, ReactElement } from 'react';
import Title from '@src/components/title/Title';
import { IObject, IComponent } from '@type/model';
import { connect } from 'dva';
import { routerRedux } from 'dva/router';
import './Report.less';

interface IProp extends IComponent { }

/**
 * @description 报告生成
 */
class Report extends Component<IProp> {
    constructor(props: IProp) {
        super(props);
    }
    render(): ReactElement {
        return <div className="bcp-upload">
            <Title returnText="返回" onReturn={() => this.props.dispatch(routerRedux.push('/tools'))}>报告生成</Title>
        </div>
    }
}
export default connect((state: IObject) => ({ state }))(Report);