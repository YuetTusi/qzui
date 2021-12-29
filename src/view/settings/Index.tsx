import React, { FC } from 'react';
import classnames from 'classnames';
import Layout from '@src/components/layout/Layout';
import { NavLink, Route } from 'dva/router';
import Officer from './Officer/Officer';
import OfficerEdit from './OfficerEdit/OfficerEdit';
import ServerConfig from './FtpConfig/FtpConfig';
import Unit from './Unit/Unit';
import DstUnit from './DstUnit/DstUnit';
import ArmyUnit from './ArmyUnit/ArmyUnit';
import Word from './Word/Word';
import CheckManage from './CheckManage/CheckManage';
import Platform from './Platform/Platform';
import Version from './Version/Version';
import InputHistory from './InputHistory/InputHistory';
import BcpConf from './BcpConf/BcpConf';
import ClearUnit from './ClearUnit/ClearUnit';
import { helper } from '@src/utils/helper';
import './Index.less';

const { max, useBcp } = helper.readConf();

/**
 * 按配置文件中的模式渲染
 * @param mode 模式（标准版/军队版）
 */
const renderByMode = () => {
	//# 为true时，会隐藏标准版本的`采集单位`和`目的检验单位`模块，换为`单位管理`代替
	//# 单位管理(ArmyUnit)模块会在本地indexeddb中维护数据，不再存储于base.db的SQLite中

	if (useBcp) {
		return (
			<>
				<li>
					<NavLink to="/settings" exact={true} replace={true} className="unit">
						<div>
							{max <= 2 ? '' : <i title="采集单位" />}
							<span>采集单位</span>
						</div>
					</NavLink>
				</li>
				<li>
					<NavLink to="/settings/dst-unit" replace={true} className="dst-unit">
						<div>
							{max <= 2 ? '' : <i title="目的检验单位" />}
							<span>目的检验单位</span>
						</div>
					</NavLink>
				</li>
			</>
		);
	} else {
		return (
			<li>
				<NavLink to="/settings/army-unit" replace={true} className="unit">
					<div>
						{max <= 2 ? '' : <i title="单位管理" />}
						<span>单位管理</span>
					</div>
				</NavLink>
			</li>
		);
	}
};

/**
 * 设置布局页
 */
const Index: FC<{}> = () => (
	<Layout>
		<div
			className={classnames('setting-panel', {
				pad: max <= 2
			})}>
			<menu
				className={classnames('setting-menu', {
					pad: max <= 2
				})}>
				<ul>
					{renderByMode()}
					<li>
						<NavLink to="/settings/officer" replace={true} className="police-officer">
							<div>
								{max <= 2 ? '' : <i title="采集人员信息" />}
								<span>采集人员信息</span>
							</div>
						</NavLink>
					</li>
					{useBcp ? (
						<li>
							<NavLink to="/settings/ftp" replace={true} className="ftp">
								<div>
									{max <= 2 ? '' : <i title="FTP配置" />}
									<span>FTP配置</span>
								</div>
							</NavLink>
						</li>
					) : null}
					<li>
						<NavLink to="/settings/word" replace={true} className="word">
							<div>
								{max <= 2 ? '' : <i title="负面词" />}
								<span>关键词配置</span>
							</div>
						</NavLink>
					</li>
					{useBcp ? (
						<li>
							<NavLink
								to="/settings/check-manage"
								replace={true}
								className="check-manage">
								<div>
									{max <= 2 ? '' : <i title="点验数据管理" />}
									<span>点验数据管理</span>
								</div>
							</NavLink>
						</li>
					) : null}

					{useBcp ? (
						<li>
							<NavLink
								to="/settings/platform"
								replace={true}
								className="cop-platform">
								<div>
									{max <= 2 ? '' : <i title="警综平台设置" />}
									<span>警综平台设置</span>
								</div>
							</NavLink>
						</li>
					) : null}
					<li>
						<NavLink to="/settings/version" replace={true} className="about">
							<div>
								{max <= 2 ? '' : <i title="版本信息" />}
								<span>版本信息</span>
							</div>
						</NavLink>
					</li>
				</ul>
			</menu>
			<div className="setting-container">
				<Route path="/settings" exact={true} component={Unit} />
				<Route path="/settings/unit" component={Unit} />
				<Route path="/settings/dst-unit" component={DstUnit} />
				<Route path="/settings/army-unit" component={ArmyUnit} />
				<Route path="/settings/officer" exact={true} component={Officer} />
				<Route path="/settings/officer/edit/:id" component={OfficerEdit} />
				<Route path="/settings/ftp" component={ServerConfig} />
				<Route path="/settings/word" component={Word} />
				<Route path="/settings/check-manage" component={CheckManage} />
				<Route path="/settings/platform" component={Platform} />
				<Route path="/settings/version" component={Version} />
				<Route path="/settings/input-history" component={InputHistory} />
				<Route path="/settings/bcp-conf" component={BcpConf} />
				<Route path="/settings/clear-unit" component={ClearUnit} />
			</div>
		</div>
	</Layout>
);

export default Index;
