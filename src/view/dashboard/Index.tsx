import React, { FC } from 'react';
import Layout from '@src/components/layout/Layout';
import { Route } from 'dva/router';
import Init from './Init/Init';

interface Prop { }

/**
 * @description 数据采集布局页
 */
const Index: FC<Prop> = (props) => {
    return <Layout>
        <Route path="/" component={Init} exact={true} />
    </Layout>;
}

export default Index;