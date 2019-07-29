import React, { Component, ReactElement, Fragment } from 'react';
import Layout from '@src/components/layout/Layout';

interface IProp { }

/**
 * @description 设置首页
 */
class Index extends Component<IProp>{
    constructor(props: any) {
        super(props);
    }
    render(): ReactElement {
        return <Layout>
            设置
        </Layout>
    }
}

export default Index;