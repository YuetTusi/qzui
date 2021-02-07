import React, { FC } from 'react';
import Layout from '@src/components/layout/Layout';
import { Route } from 'dva/router';
import Device from './Device/Device';

/**
 * @description 数据采集布局页
 */
const Index: FC<Record<string, any>> = (props) => (
	<Layout>
		<Route path="/" component={Device} exact={true} />
	</Layout>
);

export default Index;
