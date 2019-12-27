import React, { Component, ReactElement, Fragment } from 'react';
import Layout from '@src/components/layout/Layout';
import { Route } from 'dva/router';
import Display from './Display/Display';

interface IProp { }

/**
 * @description 数据解析
 */
class Index extends Component<IProp>{
    constructor(props: any) {
        super(props);
    }
    render(): ReactElement {
        return <Layout>
            <Route path="/record" component={Display} exact={true} />
        </Layout>
    }
}

export default Index;