import React, { SFC, MouseEvent } from 'react';
import { remote } from 'electron';
import { connect } from 'dva';
import { routerRedux } from 'dva/router';
import { NavLink } from 'dva/router';
import { StoreComponent } from '@src/type/model';
import classnames from 'classnames';
import { helper } from '@utils/helper';
import { hiddenMenu } from './hiddenMenu';
import iconLogo from './images/icon.png';
import './Nav.less';

const config = helper.readConf();

interface Prop extends StoreComponent { }

/**
 * 导航菜单
 * @param props 
 */
const Nav: SFC<Prop> = (props): JSX.Element => {

    const renderBottomLogo = () => {

        if (config.max <= 2) {
            return <div className="bottom-logo">
                <img src={iconLogo} className="logo-icon" alt="logo" />
                <div className="text">
                    <div>N次方</div>
                    <div>手机多路取证塔</div>
                </div>
            </div>;
        } else {
            return null;
        }
    };

    return <nav className={classnames('top-nav', { pad: config.max <= 2 })}>
        <ul className={classnames({ pad: config.max <= 2 })}>
            <li style={{ display: config.max > 2 ? 'list-item' : 'none' }}
                onContextMenu={(e: MouseEvent<HTMLLIElement>) => {
                    e.preventDefault();
                    const { clientX, clientY } = e;
                    const { dispatch } = props;

                    if (clientX < 20 && clientY < 20) {
                        const ctxMenu = hiddenMenu([
                            { label: '采集日志管理', click: () => dispatch(routerRedux.push('/operation?role=admin')) },
                            { label: '解析日志管理', click: () => dispatch(routerRedux.push('/operation/parse-log?role=admin')) },
                            { label: '历史记录清除', click: () => dispatch(routerRedux.push('/settings/input-history')) },
                            { label: '打开DevTools', click: () => remote.getCurrentWebContents().openDevTools() }
                        ]);
                        ctxMenu.popup({ x: clientX, y: clientY });
                    }
                }}
                onDoubleClick={(e: MouseEvent<HTMLLIElement>) => {
                    const { dispatch } = props;
                    const { clientX, clientY } = e;
                    if (clientX < 10 && clientY < 10) {
                        document.body.setAttribute('class', 'eggs');
                    }
                }}><div className="logo"></div></li>
            <li>
                <NavLink to="/case" replace={true}>
                    {config.max <= 2 ? <i className="case" /> : ''}
                    <span>案件管理</span></NavLink>
            </li>
            <li>
                <NavLink to="/" replace={true} exact={true}>
                    {config.max <= 2 ? <i className="dashboard" /> : ''}
                    <span>设备取证</span>
                </NavLink>
            </li>
            <li>
                <NavLink to="/record" replace={true}>
                    {config.max <= 2 ? <i className="record" /> : ''}
                    <span>数据解析</span>
                </NavLink>
            </li>
            <li>
                <NavLink to="/tools" replace={true}>
                    {config.max <= 2 ? <i className="tools" /> : ''}
                    <span>工具箱</span>
                </NavLink>
            </li>
            <li>
                <NavLink to="/operation" replace={true}>
                    {config.max <= 2 ? <i className="operation" /> : ''}
                    <span>操作日志</span>
                </NavLink>
            </li>
            <li>
                <NavLink to="/settings" replace={true}>
                    {config.max <= 2 ? <i className="settings" /> : ''}
                    <span>设置</span>
                </NavLink>
            </li>
        </ul>
        {renderBottomLogo()}
    </nav>
}

export default connect(() => ({ nav: null }))(Nav);