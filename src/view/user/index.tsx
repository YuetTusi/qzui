import React, { Component } from 'react';
import { IComponent, IObject } from '@type/model';
import { connect } from 'dva';
import Layout from '@src/components/Layout';

interface IProp extends IComponent {
    user: any;
}

class Index extends Component<IProp>{
    render(): React.ReactElement {
        return <Layout>
            <h1>UserIndex</h1>
        </Layout>;
    }
}

export default connect((state: IObject): IObject => ({ user: state.user }))(Index);