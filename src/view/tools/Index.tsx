import React, { FC } from 'react';
import Layout from '@src/components/layout/Layout';
import { Route } from 'dva/router';
import Menu from './Menu/Menu';

interface Prop {}

/**
 * 工具箱布局页
 */
const Index: FC<Prop> = () => (
	<Layout>
		{/* 菜单页 */}
		<Route path="/tools" exact={true} component={Menu} />
	</Layout>
);

export default Index;
