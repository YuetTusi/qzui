import React, { Component, ReactElement } from 'react';
import Title from '@src/components/title/Title';
import { IObject, StoreComponent } from '@type/model';
import { connect } from 'dva';
import { routerRedux } from 'dva/router';
import './BcpGenerator.less';

interface IProp extends StoreComponent { }

/**
 * @description BCP文件生成
 */
class BcpGenerator extends Component<IProp> {
    constructor(props: IProp) {
        super(props);
    }
    render(): ReactElement {
        return <div className="bcp-generator">
            <Title returnText="返回" onReturn={() => this.props.dispatch(routerRedux.push('/tools'))}> BCP文件生成</Title>
        </div>;
    }
}
export default connect((state: IObject) => ({ state }))(BcpGenerator);