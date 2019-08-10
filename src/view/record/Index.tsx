import React, { Component, ReactElement, Fragment } from 'react';
import Layout from '@src/components/layout/Layout';
import { Route } from 'dva/router';
import CaseInfo from './CaseInfo/CaseInfo';

interface IProp { }

/**
 * @description 采集记录
 */
class Index extends Component<IProp>{
    constructor(props: any) {
        super(props);
    }
    render(): ReactElement {
        return <Layout>
            <Route path="/record" component={CaseInfo} exact={true} />
        </Layout>
    }
}

export default Index;