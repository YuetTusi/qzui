import React, { PropsWithChildren } from 'react';
import Layout from '@src/components/layout/Layout';
import { Route } from 'dva/router';
import Init from './Init/Init';

interface IProp { }

/**
 * @description 数据采集布局页
 */
function Index(props: PropsWithChildren<IProp>) {
    return <Layout>
        <Route path="/" component={Init} exact={true} />
    </Layout>;
}

export default Index;