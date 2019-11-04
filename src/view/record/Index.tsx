import React, { Component, ReactElement, Fragment } from 'react';
import Layout from '@src/components/layout/Layout';
import { Route } from 'dva/router';
import Display from './Display/Display';
import PhoneList from './PhoneList/PhoneList';
import Parsing from './Parsing/Parsing';
import CaseInfo from './CaseInfo/CaseInfo';
import BaseDetail from './BaseDetail/BaseDetail';
import Message from './Message/Message';
import Phonebook from './Phonebook/Phonebook';
import CallLog from './CallLog/CallLog';
import Calendar from './Calendar/Calendar';
import Wechat from './Wechat/Wechat';

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
            {/* 手机列表 */}
            <Route path="/record/phone-list" component={PhoneList} />
            {/* 解析详情 */}
            <Route path="/record/parsing" component={Parsing} />
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
            {/* 日历 */}
            <Route path="/record/calendar" component={Calendar} />
            {/* 微信 */}
            <Route path="/record/wechat" component={Wechat} />
        </Layout>
    }
}

export default Index;