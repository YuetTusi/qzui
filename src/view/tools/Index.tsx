import React, { FC } from 'react';
import Layout from '@src/components/layout/Layout';
import { Route } from 'dva/router';
import Menu from './Menu/Menu';

/**
 * 工具箱布局页
 */
const Index: FC<{}> = () => (
	<Layout>
		{/* 菜单页 */}
		<Route path="/tools" exact={true} component={Menu} />
	</Layout>
);

export default Index;
