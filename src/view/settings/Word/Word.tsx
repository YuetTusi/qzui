import React, { Component } from 'react';
import { connect } from 'dva';
import Tabs from 'antd/lib/tabs';
import Title from '@src/components/title/Title';
import { Prop, State } from './componentTypes';
import { helper } from '@src/utils/helper';
import { Button } from 'antd';
import Crime from './components/Crime/Crime';

const { TabPane } = Tabs;

/**
 * 涉案词设置
 * @param props 
 */
class Word extends Component<Prop, State> {

    constructor(props: any) {
        super(props);
    }
    render() {
        return <div className="word-root">
            <Tabs>
                <TabPane tab="涉案词" key="1">
                    <Crime />
                </TabPane>
                <TabPane tab="APP" key="2">
                    <div>APP</div>
                </TabPane>
            </Tabs>
        </div>;
    }
}

export default connect((state: any) => ({ word: state.word }))(Word);
