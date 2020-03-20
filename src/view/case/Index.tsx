import React from 'react';
import Layout from '@src/components/layout/Layout';
import CaseData from './CaseData/CaseData';
import CaseAdd from './CaseAdd/CaseAdd';
import CaseEdit from './CaseEdit/CaseEdit';
import { Route } from 'dva/router';

function Index() {
    return <Layout>
        <Route path="/case" exact={true} component={CaseData} />
        <Route path="/case/case-add" component={CaseAdd} />
        <Route path="/case/case-edit/:path" component={CaseEdit} />
    </Layout>;
}

export default Index;