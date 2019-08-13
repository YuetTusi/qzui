import React, { Component, ReactElement, Fragment } from 'react';
import Layout from '@src/components/layout/Layout';
import { Route } from 'dva/router';
import Display from './Display/Display';
import CaseInfo from './CaseInfo/CaseInfo';
import BaseDetail from './BaseDetail/BaseDetail';
import Message from './Message/Message';

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
            <Route path="/record/case-info" component={CaseInfo} />
            <Route path="/record/base-detail" component={BaseDetail} />
            <Route path="/record/message" component={Message} />
        </Layout>
    }
}

export default Index;