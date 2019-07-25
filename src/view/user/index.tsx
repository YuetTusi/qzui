import React, { Component } from 'react';
import { IComponent, IObject } from '@type/model';
import { connect } from 'dva';
import Layout from '@src/components/layout/Layout';
import { NavLink, Route } from 'dva/router';
import List from './List';
import Detail from './Detail';

class Index extends Component {
    render(): React.ReactElement {
        return <Layout>
            <Route path="/user" exact={true} component={List} />
            <Route path="/user/list" component={List} />
            <Route path="/user/detail/:id"  exact={true} component={Detail} />
        </Layout>;
    }
}

export default Index;