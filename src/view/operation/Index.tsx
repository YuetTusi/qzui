import React, { PropsWithChildren } from 'react';
import Layout from '@src/components/layout/Layout';
import { Route, NavLink } from 'dva/router';
import FetchLog from './FetchLog/FetchLog';
import ParseLog from './ParseLog/ParseLog';
import './Index.less';

interface IProp { }

/**
 * 操作日志布局页
 * @param props 
 */
function Index(props: PropsWithChildren<IProp>): JSX.Element {
    return <Layout>
        <div className="operation-root">
            <menu className="log-menu">
                <ul>
                    <li>
                        <NavLink to="/operation" replace={true} exact={true} className="fetch">
                            <div>
                                <i title="采集日志" />
                                <span>采集日志</span>
                            </div>
                        </NavLink>
                    </li>
                    {/* <li>
                        <NavLink to="/operation/parse-log" replace={true} className="parse">
                            <div>
                                <i title="解析日志" />
                                <span>解析日志</span>
                            </div>
                        </NavLink>
                    </li> */}
                </ul>
            </menu>
            <div className="operation-container">
                {/* 采集日志 */}
                <Route path="/operation" exact={true} component={FetchLog} />
                <Route path="/operation/parse-log" component={ParseLog} />
            </div>
        </div>
    </Layout>;
}

export default Index;