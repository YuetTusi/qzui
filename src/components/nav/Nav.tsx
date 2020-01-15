import React, { PropsWithChildren, MouseEvent } from 'react';
import { NavLink } from 'dva/router';
import DiskInfo from '@src/components/DiskInfo/DiskInfo';
import './Nav.less';

interface IProp { }



/**
 * 导航菜单
 * @param props 
 */
function Nav(props: PropsWithChildren<IProp>): JSX.Element {
    return <nav className="top-nav">
        <ul>
            <li onDoubleClick={(e: MouseEvent<HTMLLIElement>) => {
                const { clientX, clientY } = e;
                if (clientX < 10 && clientY < 10) {
                    document.body.setAttribute('class', 'eggs');
                }
            }}><div className="logo"></div></li>
            <li><NavLink to="/" replace={true} exact={true} className="home"><span>设备取证</span></NavLink></li>
            <li><NavLink to="/record" replace={true} className="collection"><span>数据解析</span></NavLink></li>
            <li><NavLink to="/tools" replace={true} className="toolkit"><span>工具箱</span></NavLink></li>
            <li><NavLink to="/settings" replace={true} className="setting"><span>设置</span></NavLink></li>
        </ul>
    </nav>
}

export default Nav;