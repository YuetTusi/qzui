import React, { Component, ReactElement, Fragment } from 'react';
import Layout from '@src/components/layout/Layout';
import { Route } from 'dva/router';
import Display from './Display/Display';
import PhoneList from './PhoneList/PhoneList';
import Parsing from './Parsing/Parsing';

interface IProp { }

/**
 * @description 数据解析
 */
class Index extends Component<IProp>{
    constructor(props: any) {
        super(props);
    }
    render(): ReactElement {
        return <Layout>
            <Route path="/record" component={Display} exact={true} />
            {/* 手机列表 */}
            <Route path="/record/phone-list" component={PhoneList} />
            {/* 解析详情 */}
            <Route path="/record/parsing" component={Parsing} />
        </Layout>
    }
}

export default Index;