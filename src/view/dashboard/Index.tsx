import React, { Component, ReactElement, Fragment } from 'react';
import Layout from '@src/components/layout/Layout';
import { IComponent } from '@type/model';
import { Route } from 'dva/router';
import Init from './Init/Init';
import Collection from './Collecting/Collecting';

interface IProp extends IComponent { }

/**
 * @description 数据采集布局页
 */
class Index extends Component<IProp>{
    constructor(props: any) {
        super(props);
    }
    render(): ReactElement {
        return <Layout>
            <Route path="/" component={Init} exact={true} />
            <Route path="/dashboard/collecting" component={Collection} />
        </Layout>
    }
}

export default Index;