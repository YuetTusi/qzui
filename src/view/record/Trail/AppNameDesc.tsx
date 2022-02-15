import React, { FC } from 'react';
import Empty from 'antd/lib/empty';
import Tag from 'antd/lib/tag';
import { helper } from '@utils/helper';
import { InstallApp } from '@src/schema/InstallApp';

/**
 * 应用名称和包名展示
 */
const AppNameDesc: FC<{ data: InstallApp | null }> = ({ data }) => {
	if (helper.isNullOrUndefined(data)) {
		return (
			<div className="empty-box">
				<Empty description="暂无数据" image={Empty.PRESENTED_IMAGE_SIMPLE} />
			</div>
		);
	}

	const { appNameList, cateNameList, apppkgList } = data!;

	if (helper.isNullOrUndefined(appNameList) || appNameList === '') {
		return (
			<div className="empty-box">
				<Empty description="暂无数据" image={Empty.PRESENTED_IMAGE_SIMPLE} />
			</div>
		);
	}

	const nameList = appNameList.split(',');
	const len = nameList.length;

	if (len === 0) {
		return (
			<div className="empty-box">
				<Empty description="暂无数据" image={Empty.PRESENTED_IMAGE_SIMPLE} />
			</div>
		);
	}

	const categoryList = helper.isNullOrUndefined(cateNameList) ? [] : cateNameList.split(',');
	const appPackages = helper.isNullOrUndefined(apppkgList) ? [] : apppkgList.split(',');

	let $dom: JSX.Element[] = [];
	for (let i = 0; i < len; i++) {
		$dom.push(
			<li key={`K_${i}`}>
				<Tag>{categoryList[i] === '' ? '未知' : categoryList[i]}</Tag>
				{`${nameList[i] ?? ''} （${appPackages[i] ?? ''}）`}
			</li>
		);
	}

	return <ul>{$dom}</ul>;
};

export default AppNameDesc;
