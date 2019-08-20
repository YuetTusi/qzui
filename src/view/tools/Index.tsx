import React, { Component, ReactElement } from 'react';
import Layout from '@src/components/layout/Layout';
import { Route } from 'dva/router';
import Menu from './Menu/Menu';
import BcpGenerator from './BcpGenerator/BcpGenerator';
import BcpUpload from './BcpUpload/BcpUpload';
import Report from './Report/Report';

interface IProp { }

/**
 * @description 工具箱首页
 */
class Index extends Component<IProp>{
    constructor(props: any) {
        super(props);
    }
    render(): ReactElement {
        return <Layout>
            {/* 菜单页 */}
            <Route path="/tools" exact={true} component={Menu} />
            {/* BCP生成 */}
            <Route path="/tools/bcp-generator" component={BcpGenerator} />
            {/* BCP上传 */}
            <Route path="/tools/bcp-upload" component={BcpUpload} />
            {/* 报告生成 */}
            <Route path="/tools/report" component={Report} />
        </Layout>
    }
}

export default Index;