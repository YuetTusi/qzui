import React, { SFC, MouseEvent } from 'react';
import { connect } from 'dva';
import { routerRedux } from 'dva/router';
import { NavLink } from 'dva/router';
import { StoreComponent } from '@src/type/model';
import './Nav.less';

interface Prop extends StoreComponent { }

/**
 * 导航菜单
 * @param props 
 */
const Nav: SFC<Prop> = (props): JSX.Element => {
    return <nav className="top-nav">
        <ul>
            <li onDoubleClick={(e: MouseEvent<HTMLLIElement>) => {
                const { clientX, clientY } = e;
                if (clientX < 10 && clientY < 10) {
                    if ((window as any).toCasePath) {
                        const { dispatch } = props;
                        dispatch(routerRedux.push('/settings/case-path'));
                    } else {
                        document.body.setAttribute('class', 'eggs');
                    }
                }
            }}><div className="logo"></div></li>
            <li><NavLink to="/case" replace={true}>案件管理</NavLink></li>
            <li><NavLink to="/" replace={true} exact={true}>设备取证</NavLink></li>
            <li><NavLink to="/record" replace={true}>数据解析</NavLink></li>
            <li><NavLink to="/tools" replace={true}>工具箱</NavLink></li>
            <li><NavLink to="/operation" replace={true}>操作日志</NavLink></li>
            <li><NavLink to="/settings/unit" replace={true}>设置</NavLink></li>
        </ul>
    </nav>
}

export default connect(() => ({ nav: null }))(Nav);