import React, { Component } from 'react';
import Layout from '@src/components/Layout';

const { dialog } = window.require('electron').remote;

// const { dialog } = remote;


class Test extends Component {
    constructor(props: any) {
        super(props);
    }
    render(): React.ReactElement {
        return <Layout>
            <div>
                <button type="button" onClick={() => {
                    dialog.showMessageBox({ title: '消息', message: '这个消息是调用Electron接口发出' })
                }}>
                    showMessage
                </button>
            </div>
        </Layout>
    }
}

export default Test;