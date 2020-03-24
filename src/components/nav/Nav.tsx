import React, { PropsWithChildren, MouseEvent } from 'react';
import { connect } from 'dva';
import { routerRedux } from 'dva/router';
import { NavLink } from 'dva/router';
// import DiskInfo from '@src/components/DiskInfo/DiskInfo';
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
                    if ((window as any).toCasePath) {
                        const { dispatch } = props as any;
                        dispatch(routerRedux.push('/settings/case-path'));
                    } else {
                        document.body.setAttribute('class', 'eggs');
                    }
                }
            }}><div className="logo"></div></li>
            <li><NavLink to="/case" replace={true} className="case">案件管理</NavLink></li>
            <li><NavLink to="/" replace={true} exact={true} className="home">设备取证</NavLink></li>
            <li><NavLink to="/record" replace={true} className="collection">数据解析</NavLink></li>
            <li><NavLink to="/tools" replace={true} className="toolkit">工具箱</NavLink></li>
            <li><NavLink to="/settings" replace={true} className="setting">设置</NavLink></li>
        </ul>
    </nav>
}

export default connect(() => ({ nav: null }))(Nav);