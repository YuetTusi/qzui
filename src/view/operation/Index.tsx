import React, { FC } from 'react';
import classnames from 'classnames';
import Layout from '@src/components/layout/Layout';
import { Route, NavLink } from 'dva/router';
import FetchLog from './FetchLog/FetchLog';
import ParseLog from './ParseLog/ParseLog';
import { helper } from '@src/utils/helper';
import './Index.less';

const config = helper.readConf();

interface Prop { }

/**
 * 操作日志布局页
 * @param props 
 */
const Index: FC<Prop> = (props) => {
    return <Layout>
        <div className={classnames('operation-root', { pad: config.max <= 2 })}>
            <menu className={classnames('log-menu', { pad: config.max <= 2 })}>
                <ul>
                    <li>
                        <NavLink to="/operation" replace={true} exact={true} className="fetch">
                            <div>
                                {config.max <= 2 ? '' : <i title="采集日志" />}
                                <span>采集日志</span>
                            </div>
                        </NavLink>
                    </li>
                    <li>
                        <NavLink to="/operation/parse-log" replace={true} className="parse">
                            <div>
                                {config.max <= 2 ? '' : <i title="解析日志" />}
                                <span>解析日志</span>
                            </div>
                        </NavLink>
                    </li>
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