import React, { Component, ReactElement, Fragment } from 'react';
import Layout from '@src/components/layout/Layout';
import { StoreComponent } from '@type/model';
import { Route } from 'dva/router';
import Collection from './Collection';

interface IProp extends StoreComponent<any> { }

/**
 * @description 数据采集布局页
 */
class Index extends Component<IProp>{
    constructor(props: any) {
        super(props);
    }
    render(): ReactElement {
        return <Layout>
            <Route path="/" component={Collection} exact={true} />
        </Layout>
    }
}

export default Index;