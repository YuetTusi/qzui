import React, { FC } from 'react';
import { Route } from 'dva/router';
import Parse from './Parse/Parse';
import Bcp from './Bcp/Bcp';
import Layout from '@src/components/layout/Layout';

interface Prop { }

/**
 * 数据解析布局页
 * @param props 
 */
const Index: FC<Prop> = (props) => {
    return <Layout>
        <Route path="/record" component={Parse} exact={true} />
        <Route path="/record/bcp/:cid/:did" component={Bcp} />
    </Layout>;
}

export default Index;