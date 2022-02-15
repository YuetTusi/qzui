import React, { FC } from 'react';
import Empty from 'antd/lib/empty';
import Tag from 'antd/lib/tag';
import { helper } from '@utils/helper';
import { InstallApp } from '@src/schema/InstallApp';

/**
 * 应用变化展示
 */
const ChangeDesc: FC<{ data: InstallApp | null }> = ({ data }) => {
	if (helper.isNullOrUndefined(data)) {
		return (
			<div className="empty-box">
				<Empty description="暂无数据" image={Empty.PRESENTED_IMAGE_SIMPLE} />
			</div>
		);
	}

	const { changePkgList, changePkgStatusList, changePkgTimeList } = data!;

	if (helper.isNullOrUndefined(changePkgList)) {
		return (
			<div className="empty-box">
				<Empty description="暂无数据" image={Empty.PRESENTED_IMAGE_SIMPLE} />
			</div>
		);
	}

	if (changePkgList.trim() === '') {
		return (
			<div className="empty-box">
				<Empty description="暂无数据" image={Empty.PRESENTED_IMAGE_SIMPLE} />
			</div>
		);
	}

	const pkgList = changePkgList.split(',');
	const len = pkgList.length;

	if (len === 0) {
		return (
			<div className="empty-box">
				<Empty description="暂无数据" image={Empty.PRESENTED_IMAGE_SIMPLE} />
			</div>
		);
	}

	const statusList = helper.isNullOrUndefined(changePkgStatusList)
		? []
		: changePkgStatusList.split(',');
	const timeList = helper.isNullOrUndefined(changePkgTimeList)
		? []
		: changePkgTimeList.split(',');
	let $dom: JSX.Element[] = [];
	for (let i = 0; i < len; i++) {
		$dom.push(
			<li key={`K_${i}`}>
				{statusList[i] === '-1' ? (
					<Tag color="red">卸载</Tag>
				) : (
					<Tag color="green">安装</Tag>
				)}
				{pkgList[i] ?? ''}（{timeList[i] ?? ''}）
			</li>
		);
	}

	return <ul>{$dom}</ul>;
};

export default ChangeDesc;
