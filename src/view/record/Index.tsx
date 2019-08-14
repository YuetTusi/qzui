import React, { Component, ReactElement, Fragment } from 'react';
import Layout from '@src/components/layout/Layout';
import { Route } from 'dva/router';
import Display from './Display/Display';
import CaseInfo from './CaseInfo/CaseInfo';
import BaseDetail from './BaseDetail/BaseDetail';
import Message from './Message/Message';
import Phonebook from './Phonebook/Phonebook';
import CallLog from './CallLog/CallLog';

interface IProp { }

/**
 * @description 采集记录
 */
class Index extends Component<IProp>{
    constructor(props: any) {
        super(props);
    }
    render(): ReactElement {
        return <Layout>
            <Route path="/record" component={Display} exact={true} />
            {/* 采集信息 */}
            <Route path="/record/case-info" component={CaseInfo} />
            {/* 手机详情 */}
            <Route path="/record/base-detail" component={BaseDetail} />
            {/* 短信 */}
            <Route path="/record/message" component={Message} />
            {/* 通讯录 */}
            <Route path="/record/phonebook" component={Phonebook} />
            {/* 通话记录 */}
            <Route path="/record/call-log" component={CallLog} />
        </Layout>
    }
}

export default Index;