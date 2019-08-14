import React, { Component, ReactElement, Fragment } from 'react';
import Layout from '@src/components/layout/Layout';
import { NavLink, Route } from 'dva/router';
import CollectType from './CollectType/CollectType';
import Officer from './Officer/Officer';
import CasePath from './CasePath/CasePath';
import ServerConfig from './ServerConfig/ServerConfig';
import Unit from './Unit/Unit';
import Version from './Version/Version';
import './Index.less';

interface IProp { }

/**
 * @description 设置首页
 */
class Index extends Component<IProp>{
    constructor(props: any) {
        super(props);
    }
    render(): ReactElement {
        return <Layout>
            <div className="setting-panel">
                <menu className="setting-menu">
                    <ul>
                        <li><NavLink to="/settings" replace={true} exact={true} className="collection"><i title="采集类型" /><span>采集类型</span></NavLink></li>
                        <li><NavLink to="/settings/officer" replace={true} className="police-officer"><i title="警员信息" /><span>警员信息</span></NavLink></li>
                        <li><NavLink to="/settings/case-path" replace={true} className="case-path"><i title="案件存储路径" /><span>案件存储路径</span></NavLink></li>
                        <li><NavLink to="/settings/server-config" replace={true} className="ftp"><i title="服务器配置" /><span>服务器配置</span></NavLink></li>
                        <li><NavLink to="/settings/unit" replace={true} className="unit"><i title="采集单位" /><span>采集单位</span></NavLink></li>
                        <li><NavLink to="/settings/version" replace={true} className="about"><i title="版本信息" /><span>版本信息</span></NavLink></li>
                    </ul>
                </menu>
                <div className="setting-container">
                    <Route path="/settings" exact={true} component={CollectType} />
                    <Route path="/settings/officer" component={Officer} />
                    <Route path="/settings/case-path" component={CasePath} />
                    <Route path="/settings/server-config" component={ServerConfig} />
                    <Route path="/settings/unit" component={Unit} />
                    <Route path="/settings/version" component={Version} />
                </div>
            </div>

        </Layout>
    }
}

export default Index;