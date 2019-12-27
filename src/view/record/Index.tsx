import React, { PropsWithChildren } from 'react';
import { Route } from 'dva/router';
import Display from './Display/Display';
import Layout from '@src/components/layout/Layout';

interface IProp { }

/**
 * 数据解析布局页
 * @param props 
 */
function Index(props: PropsWithChildren<IProp>): JSX.Element {
    return <Layout>
        <Route path="/record" component={Display} exact={true} />
    </Layout>;
}

export default Index;