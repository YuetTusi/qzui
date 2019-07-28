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
            <li><NavLink to="/" replace={true}>Default</NavLink></li>
            <li><NavLink to="/user" replace={true}>User</NavLink></li>
            <li><NavLink to="/profile" replace={true}>Profile</NavLink></li>
        </ul>
    </nav>
}

export default Nav;