import React, { Component } from 'react';
import { connect } from 'dva';
import Tabs from 'antd/lib/tabs';
import { Prop, State } from './componentTypes';
import Crime from './components/Crime/Crime';
import SensitiveApp from './components/SensitiveApp/SensitiveApp';
import Browser from './components/Browser/Browser';
import './Word.less';

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
        return (
            <div className="word-root">
                <Tabs>
                    <TabPane tab="聊天内容" key="T_1">
                        <Crime />
                    </TabPane>
                    <TabPane tab="浏览器" key="T_2">
                        <Browser />
                    </TabPane>
                    <TabPane tab="敏感APP" key="T_3">
                        <SensitiveApp />
                    </TabPane>
                </Tabs>
            </div>
        );
    }
}

export default connect((state: any) => ({ word: state.word }))(Word);
