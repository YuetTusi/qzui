import path from 'path';
import { ipcRenderer } from 'electron';
import React, { FC, MouseEvent } from 'react';
import { connect } from 'dva';
import { NavLink } from 'dva/router';
import { StoreComponent } from '@src/type/model';
import classnames from 'classnames';
import { helper } from '@utils/helper';
import BottomLogo from './BottomLogo';
import iconLogo from './images/icon.png';
import './Nav.less';

const config = helper.readConf();
const appPath = process.cwd();
const logoPath =
	process.env.NODE_ENV === 'development'
		? iconLogo
		: path.join(appPath, `./resources/config/${config.logo}`);

/**
 * 导航菜单
 */
const Nav: FC<{}> = () => (
	<nav
		className={classnames('top-nav', { pad: config.max <= 2 })}
		onContextMenu={(event: MouseEvent<HTMLElement>) => {
			event.preventDefault();
			const { clientX, clientY } = event;

			if (clientX < 20 && clientY < 20) {
				ipcRenderer.send('create-setting-menu', {
					x: clientX,
					y: clientY
				});
			}
		}}>
		<ul className={classnames({ pad: config.max <= 2 })}>
			<li
				style={{ display: config.max > 2 ? 'list-item' : 'none' }}
				onDoubleClick={(e: MouseEvent<HTMLLIElement>) => {
					const { clientX, clientY } = e;
					if (clientX < 10 && clientY < 10) {
						document.body.setAttribute('class', 'eggs');
						setTimeout(() => {
							document.body.removeAttribute('class');
						}, 2000);
					}
				}}>
				<div className="logo">
					<img src={logoPath} height="50" alt="logo" />
				</div>
			</li>
			<li>
				<NavLink to="/case" replace={true}>
					{config.max <= 2 ? <i className="case" /> : ''}
					<span>案件管理</span>
				</NavLink>
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
			{config.useToolBox ? (
				<li>
					<NavLink to="/tools" replace={true}>
						{config.max <= 2 ? <i className="tools" /> : ''}
						<span>工具箱</span>
					</NavLink>
				</li>
			) : null}
			<li>
				<NavLink to="/operation" replace={true}>
					{config.max <= 2 ? <i className="operation" /> : ''}
					<span>操作日志</span>
				</NavLink>
			</li>
			<li>
				<NavLink to={config.useBcp ? '/settings' : '/settings/army-unit'} replace={true}>
					{config.max <= 2 ? <i className="settings" /> : ''}
					<span>设置</span>
				</NavLink>
			</li>
		</ul>
		{config.max <= 2 ? <BottomLogo /> : null}
	</nav>
);

export default connect(() => ({ nav: null }))(Nav);
