import React, { FC } from 'react';
import classnames from 'classnames';
import Layout from '@src/components/layout/Layout';
import { NavLink, Route } from 'dva/router';
import Officer from './Officer/Officer';
import OfficerEdit from './OfficerEdit/OfficerEdit';
import CasePath from './CasePath/CasePath';
// import ServerConfig from './ServerConfig/ServerConfig';
import Unit from './Unit/Unit';
import Version from './Version/Version';
import { helper } from '@src/utils/helper';
import './Index.less';

const config = helper.getConfig();

interface Prop { }

/**
 * 设置布局页
 * @param props 
 */
const Index: FC<Prop> = (props) => {
    return <Layout>
        <div className={classnames("setting-panel", { pad: config.max <= 2 })}>
            <menu className={classnames("setting-menu", { pad: config.max <= 2 })}>
                <ul>
                    <li>
                        <NavLink to="/settings" exact={true} replace={true} className="unit">
                            <div>
                                {config.max <= 2 ? '' : <i title="检验单位" />}
                                <span>检验单位</span>
                            </div>
                        </NavLink>
                    </li>
                    <li>
                        <NavLink to="/settings/officer" replace={true} className="police-officer">
                            <div>
                                {config.max <= 2 ? '' : <i title="检验员信息" />}
                                <span>检验员信息</span>
                            </div>
                        </NavLink>
                    </li>
                    <li>
                        <NavLink to="/settings/case-path" replace={true} className="case-path">
                            <div>
                                {config.max <= 2 ? '' : <i title="案件存储路径" />}
                                <span>案件存储路径</span>
                            </div>
                        </NavLink>
                    </li>
                    <li>
                        <NavLink to="/settings/version" replace={true} className="about">
                            <div>
                                {config.max <= 2 ? '' : <i title="版本信息" />}
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