import React, { PropsWithChildren } from 'react';
import Layout from '@src/components/layout/Layout';
import { NavLink, Route } from 'dva/router';
import Officer from './Officer/Officer';
import OfficerEdit from './OfficerEdit/OfficerEdit';
import CasePath from './CasePath/CasePath';
// import ServerConfig from './ServerConfig/ServerConfig';
import Unit from './Unit/Unit';
import Version from './Version/Version';
import './Index.less';

interface IProp { }

/**
 * 设置布局页
 * @param props 
 */
function Index(props: PropsWithChildren<IProp>): JSX.Element {
    return <Layout>
        <div className="setting-panel">
            <menu className="setting-menu">
                <ul>
                    <li>
                        <NavLink to="/settings/unit" replace={true} className="unit">
                            <div>
                                <i title="检验单位" />
                                <span>检验单位</span>
                            </div>
                        </NavLink>
                    </li>
                    <li>
                        <NavLink to="/settings/officer" replace={true} className="police-officer">
                            <div>
                                <i title="检验员信息" />
                                <span>检验员信息</span>
                            </div>
                        </NavLink>
                    </li>
                    <li>
                        <NavLink to="/settings/case-path" replace={true} className="case-path">
                            <div>
                                <i title="案件存储路径" />
                                <span>案件存储路径</span>
                            </div>
                        </NavLink>
                    </li>
                    <li>
                        <NavLink to="/settings/version" replace={true} className="about">
                            <div>
                                <i title="版本信息" />
                                <span>版本信息</span>
                            </div>
                        </NavLink>
                    </li>
                </ul>
            </menu>
            <div className="setting-container">
                <Route path="/settings" exact={true} component={Unit} />
                <Route path="/settings/unit" component={Unit} />
                <Route path="/settings/officer" exact={true} component={Officer} />
                <Route path="/settings/officer/edit/:id" component={OfficerEdit} />
                <Route path="/settings/case-path" component={CasePath} />
                {/* <Route path="/settings/server-config " component={ServerConfig} /> */}
                <Route path="/settings/version" component={Version} />
            </div>
        </div>
    </Layout>;
}

export default Index;