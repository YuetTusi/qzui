import React from 'react';
import Modal from 'antd/lib/modal';
import { ColumnGroupProps } from 'antd/lib/table/ColumnGroup';
import { ipcRenderer } from 'electron';
import { Context } from './componentType';

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
			align: 'center'
		},
		{
			title: '删除',
			dataIndex: 'PcsID',
			key: 'PcsID',
			width: 60,
			align: 'center',
			render(id: string, record: any) {
				return (
					<a
						data-id={id}
						onClick={() => {
							Modal.confirm({
								onOk() {
									ctx.deleteUnit(id);
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
			}
		}
	];
	return columns;
}
