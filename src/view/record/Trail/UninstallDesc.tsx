import React, { FC } from 'react';
import Empty from 'antd/lib/empty';
import Tag from 'antd/lib/tag';
import { helper } from '@utils/helper';
import { InstallApp } from '@src/schema/InstallApp';

/**
 * 卸载应用展示
 */
const UninstallDesc: FC<{ data: InstallApp | null }> = ({ data }) => {
	if (helper.isNullOrUndefined(data)) {
		return (
			<div className="empty-box">
				<Empty description="暂无数据" image={Empty.PRESENTED_IMAGE_SIMPLE} />
			</div>
		);
	}

	const { unstallAppNameList, unstallApppkgList, unstallCateNameList, unstallAppStatusDayList } =
		data!;

	if (helper.isNullOrUndefined(unstallAppNameList) || unstallAppNameList === '') {
		return (
			<div className="empty-box">
				<Empty description="暂无数据" image={Empty.PRESENTED_IMAGE_SIMPLE} />
			</div>
		);
	}

	const nameList = unstallAppNameList.split(',');
	const len = nameList.length;

	if (len === 0) {
		return (
			<div className="empty-box">
				<Empty description="暂无数据" image={Empty.PRESENTED_IMAGE_SIMPLE} />
			</div>
		);
	}

	const categoryList = helper.isNullOrUndefined(unstallCateNameList)
		? []
		: unstallCateNameList.split(',');
	const appPackages = helper.isNullOrUndefined(unstallApppkgList)
		? []
		: unstallApppkgList.split(',');
	const dayList = helper.isNullOrUndefined(unstallAppStatusDayList)
		? []
		: unstallAppStatusDayList.split(',');

	let $dom: JSX.Element[] = [];
	for (let i = 0; i < len; i++) {
		$dom.push(
			<li key={`K_${i}`}>
				<Tag>{categoryList[i] === '' ? '未知' : categoryList[i]}</Tag>
				{`${nameList[i] ?? ''} （${appPackages[i] ?? ''}） ${dayList[i] ?? ''}`}
			</li>
		);
	}

	return <ul>{$dom}</ul>;
};

export default UninstallDesc;
