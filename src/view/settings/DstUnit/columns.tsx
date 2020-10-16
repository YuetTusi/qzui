import React from 'react';
import { ColumnGroupProps } from 'antd/lib/table/ColumnGroup';

/**
 * 表头定义
 */
export function getColumns(): ColumnGroupProps[] {
	let columns = [
		{
			title: '检验单位',
			dataIndex: 'PcsName',
			key: 'PcsName',
			render(val: string) {
				if (val) {
					return <span>{val.trim()}</span>;
				} else {
					return null;
				}
			}
		},
		{
			title: '单位编号',
			dataIndex: 'PcsCode',
			key: 'PcsCode',
			width: 140,
			align: 'center',
			render(value: string) {
				if (value.startsWith('USR')) {
					return <span>▪▪▪▪▪▪▪▪▪▪▪▪</span>;
				} else {
					return <span>{value}</span>;
				}
			}
		}
	];
	return columns;
}
