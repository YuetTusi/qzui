import React from 'react';
import { NavLink } from 'dva/router';

function Nav(props: any): React.ReactElement {
    return <nav>
        <ul>
            <li><NavLink to="/" replace={true}>Default</NavLink></li>
            <li><NavLink to="/profile" replace={true}>Profile</NavLink></li>
            <li><NavLink to="/test" replace={true}>Test</NavLink></li>
        </ul>
    </nav>
}

export default Nav;