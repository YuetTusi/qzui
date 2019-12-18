import React, { PropsWithChildren } from 'react';
import { NavLink } from 'dva/router';
import './Nav.less';

interface IProp { }



/**
 * 导航菜单
 * @param props 
 */
function Nav(props: PropsWithChildren<IProp>): JSX.Element {
    return <nav className="left-nav">
        <ul>
            <li><div className="logo"></div></li>
            <li><NavLink to="/" replace={true} exact={true} className="home"><i title="设备取证" /><span>设备取证</span></NavLink></li>
            <li><NavLink to="/record" replace={true} className="collection"><i title="数据解析" /><span>数据解析</span></NavLink></li>
            <li><NavLink to="/tools" replace={true} className="toolkit"><i title="工具箱" /><span>工具箱</span></NavLink></li>
            <li><NavLink to="/settings" replace={true} className="setting"><i title="设置" /><span>设置</span></NavLink></li>
        </ul>
    </nav>
}

export default Nav;