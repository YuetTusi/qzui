import React, { PropsWithChildren, ReactElement } from 'react';
import { NavLink } from 'dva/router';
import './Nav.less';

interface IProp {

}

/**
 * 导航菜单
 * @param props 
 */
function Nav(props: PropsWithChildren<IProp>): ReactElement {
    return <nav className="left-nav">
        <ul>
            <li><div className="logo"></div></li>
            <li><NavLink to="/" replace={true} exact={true} className="home"><i title="数据采集" /></NavLink></li>
            <li><NavLink to="/record" replace={true} className="collection"><i title="采集记录" /></NavLink></li>
            <li><NavLink to="/tools" replace={true} className="toolkit"><i title="工具箱" /></NavLink></li>
            <li><NavLink to="/settings" replace={true} className="setting"><i title="设置" /></NavLink></li>
        </ul>
    </nav>
}

export default Nav;