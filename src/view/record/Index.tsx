import React, { FC } from 'react';
import { Route } from 'dva/router';
import Display from './Display/Display';
import Layout from '@src/components/layout/Layout';

interface Prop { }

/**
 * 数据解析布局页
 * @param props 
 */
const Index: FC<Prop> = (props) => {
    return <Layout>
        <Route path="/record" component={Display} exact={true} />
    </Layout>;
}

export default Index;