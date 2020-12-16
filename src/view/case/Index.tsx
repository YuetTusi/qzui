import React, { FC } from 'react';
import { Route } from 'dva/router';
import Layout from '@src/components/layout/Layout';
import CaseData from './CaseData/CaseData';
import CaseAdd from './CaseAdd/CaseAdd';
import CaseEdit from './CaseEdit/CaseEdit';

const Index: FC<{}> = (props) => {
	return (
		<Layout>
			<Route path="/case" exact={true} component={CaseData} />
			<Route path="/case/case-add" component={CaseAdd} />
			<Route path="/case/case-edit/:id" component={CaseEdit} />
		</Layout>
	);
};

export default Index;
