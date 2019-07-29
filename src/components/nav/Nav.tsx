import React, { PropsWithChildren, ReactElement } from 'react';
import { NavLink } from 'dva/router';

interface IProp {

}

/**
 * 导航菜单
 * @param props 
 */
function Nav(props: PropsWithChildren<IProp>): ReactElement {
    return <nav>
        <ul>
            <li><NavLink to="/collection" replace={true}>数据采集</NavLink></li>
            <li><NavLink to="/record" replace={true}>采集记录</NavLink></li>
            <li><NavLink to="/tools" replace={true}>工具箱</NavLink></li>
            <li><NavLink to="/settings" replace={true}>设置</NavLink></li>
        </ul>
    </nav>
}

export default Nav;