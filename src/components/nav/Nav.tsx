import { ipcRenderer } from 'electron';
import React, { FC, MouseEvent } from 'react';
import { connect } from 'dva';
import { NavLink } from 'dva/router';
import Icon from 'antd/lib/icon';
// import classnames from 'classnames';
import { useManufaturer } from '@src/hooks';
import { helper } from '@utils/helper';
// import BottomLogo from './BottomLogo';
import logo from './images/logo.png';
import './Nav.less';

const config = helper.readConf();
// const appPath = process.cwd();
const title = localStorage.getItem('materials_name');

/**
 * 导航菜单
 */
const Nav: FC<{}> = () => {

	const manu = useManufaturer();

	return <nav
		className="top-nav"
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
		<div className="bg-top">
			<img src={logo} alt="logo" width={65} height={70} />
			<span>{title ?? ''}</span>
		</div>
		<ul>
			<li>
				<NavLink to="/case" replace={true}>
					<Icon type="file-text" />
					<span>案件管理</span>
				</NavLink>
			</li>
			<li>
				<NavLink to="/" replace={true} exact={true}>
					<Icon type="mobile" />
					<span>设备取证</span>
				</NavLink>
			</li>
			<li>
				<NavLink to="/record" replace={true}>
					<Icon type="file-sync" />
					<span>数据解析</span>
				</NavLink>
			</li>
			{config.useToolBox ? (
				<li>
					<NavLink to="/tools" replace={true}>
						<Icon type="tool" />
						<span>工具箱</span>
					</NavLink>
				</li>
			) : null}
			<li>
				<NavLink to="/operation" replace={true}>
					<Icon type="schedule" />
					<span>操作日志</span>
				</NavLink>
			</li>
			<li>
				<NavLink to={config.useBcp ? '/settings' : '/settings/army-unit'} replace={true}>
					<Icon type="setting" />
					<span>设置</span>
				</NavLink>
			</li>
		</ul>
		<div className="bg-bottom">

		</div>
	</nav>
};

export default connect(() => ({ nav: null }))(Nav);
