import React, { FC } from 'react';
import { Route } from 'dva/router';
import Parse from './Parse/Parse';
import Bcp from './Bcp/Bcp';
import Layout from '@src/components/layout/Layout';

/**
 * 数据解析布局页
 */
const Index: FC<{}> = () => (
	<Layout>
		<Route path="/record" component={Parse} exact={true} />
		<Route path="/record/bcp/:cid/:did" component={Bcp} />
	</Layout>
);

export default Index;
