import React, { FC } from 'react';
import { Route } from 'dva/router';
import Parse from './Parse/Parse';
import Bcp from './Bcp/Bcp';
import HitResult from './HitResult/HitResult';
import Trail from './Trail';
import Layout from '@src/components/layout/Layout';

/**
 * 数据解析布局页
 */
const Index: FC<{}> = () => (
	<Layout>
		<Route path="/record" component={Parse} exact={true} />
		<Route path="/record/bcp/:cid/:did" component={Bcp} />
		<Route path="/record/hit-result/:cid/:did" component={HitResult} />
		<Route path="/record/trail/:cid/:did" component={Trail} />
	</Layout>
);

export default Index;
