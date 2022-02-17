import React, { FC } from 'react';
import Empty from 'antd/lib/empty';
import Tabs from 'antd/lib/tabs';
import { helper } from '@utils/helper';
import InstallList from './InstallList';
import AppNameDesc from './AppNameDesc';
import ChangeDesc from './ChangeDesc';
import UninstallDesc from './UninstallDesc';
import AppCategoryChart from './AppCategoryChart';
import AppStatusChart from './AppStatusChart';
import UninstallCategoryChart from './UninstallCategoryChart';
import { InstallTabProp } from './prop';

const { TabPane } = Tabs;

/**
 * 选项卡组件
 */
const InstallTab: FC<InstallTabProp> = ({ installData }) => {
	const renderTab = () => {
		if (installData === null) {
			return <Empty description="暂无App数据" image={Empty.PRESENTED_IMAGE_SIMPLE} />;
		} else {
			return (
				<Tabs size="small">
					<TabPane tab="最近活跃时间" key="T1">
						<div className="install-u-list">
							<InstallList
								list={
									helper.isNullOrUndefined(installData.lastActiveTime30List)
										? []
										: installData.lastActiveTime30List.split(',')
								}
							/>
						</div>
					</TabPane>
					<TabPane tab="30天内活跃天数" key="T2">
						<div className="install-u-list">
							<InstallList
								list={
									helper.isNullOrUndefined(installData.activeDay30List)
										? []
										: installData.activeDay30List.split(',')
								}
							/>
						</div>
					</TabPane>
					<TabPane tab="在装应用及包名" key="T3">
						<div className="install-u-list">
							<AppNameDesc data={installData} />
						</div>
					</TabPane>
					<TabPane tab="在装应用及包名统计" key="T4">
						<AppCategoryChart data={installData} />
					</TabPane>
					<TabPane tab="应用变化信息" key="T5">
						<div className="install-u-list">
							<ChangeDesc data={installData} />
						</div>
					</TabPane>
					<TabPane tab="变化统计" key="T6">
						<AppStatusChart data={installData} />
					</TabPane>
					<TabPane tab="近半年卸载App" key="T7">
						<div className="install-u-list">
							<UninstallDesc data={installData} />
						</div>
					</TabPane>
					<TabPane tab="卸载统计" key="T8">
						<UninstallCategoryChart data={installData} />
					</TabPane>
				</Tabs>
			);
		}
	};

	return renderTab();
};

export default InstallTab;
