import React, { Component } from 'react';
import Layout from '@src/components/Layout';


class Test extends Component {
    constructor(props: any) {
        super(props);
    }
    render(): React.ReactElement {
        return <Layout><h1>Test</h1></Layout>
    }
}

export default Test;