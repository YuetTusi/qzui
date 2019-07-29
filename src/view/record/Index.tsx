import React, { Component, ReactElement, Fragment } from 'react';
import Layout from '@src/components/layout/Layout';

interface IProp { }

/**
 * @description 采集记录首页
 */
class Index extends Component<IProp>{
    constructor(props: any) {
        super(props);
    }
    render(): ReactElement {
        return <Layout>
            采集记录
        </Layout>
    }
}

export default Index;