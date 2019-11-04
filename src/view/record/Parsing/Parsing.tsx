import React, { Component, ReactNode } from 'react';
import { connect } from 'dva';
import { routerRedux } from 'dva/router';
import { IComponent, IObject } from '@src/type/model';
import Title from '@src/components/title/Title';
import './Parsing.less';

interface IProp extends IComponent {

}
interface IState { }

/**
 * 解析详情
 */
class Parsing extends Component<IProp, IState> {
    constructor(props: IProp) {
        super(props);
    }
    render(): ReactNode {
        const { dispatch } = this.props;
        return <div className="parsing-root">
            <Title
                returnText="返回"
                onReturn={() => dispatch(routerRedux.push('/record/phone-list'))}>解析详情</Title>
            <div className="scroll-panel">
                解析详情
            </div>
        </div>
    }
}
export default connect((state: IObject) => ({ parsing: state.parsing }))(Parsing);