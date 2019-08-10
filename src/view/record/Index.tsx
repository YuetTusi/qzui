import React, { Component, ReactElement, Fragment } from 'react';
import Layout from '@src/components/layout/Layout';
import { Route } from 'dva/router';
import Display from './Display/Display';
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
            <Route path="/record" component={Display} exact={true} />
            <Route path="/record/caseinfo" component={CaseInfo} />
        </Layout>
    }
}

export default Index;