import React, { Component, ReactElement, Fragment } from 'react';
import Layout from '@src/components/layout/Layout';

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
            工具箱
        </Layout>
    }
}

export default Index;