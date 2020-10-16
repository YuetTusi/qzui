import React from 'react';
import Modal from 'antd/lib/modal';
import { ColumnGroupProps } from 'antd/lib/table/ColumnGroup';
import { Context, UnitRecord } from './componentType';

/**
 * 表头定义
 */
export function getColumns(ctx: Context): ColumnGroupProps[] {
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
					//单位编号以`USR`开头是用户自行维护的单位，不显示编号
					return <span>▪▪▪▪▪▪▪▪▪▪▪▪</span>;
				} else {
					return <span>{value}</span>;
				}
			}
		},
		{
			title: '删除',
			dataIndex: 'PcsID',
			key: 'PcsID',
			width: 60,
			align: 'center',
			render(id: string, record: UnitRecord) {
				if (record.PcsCode.startsWith('USR')) {
					return (
						<a
							data-id={id}
							onClick={() => {
								Modal.confirm({
									onOk() {
										ctx.deleteUnit(record);
									},
									title: `删除单位`,
									content: `确认删除「${record.PcsName}」?`,
									okText: '是',
									cancelText: '否'
								});
							}}>
							删除
						</a>
					);
				} else {
					return <span style={{ cursor: 'not-allowed' }}>删除</span>;
				}
			}
		}
	];
	return columns;
}
