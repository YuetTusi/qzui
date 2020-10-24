import React from 'react';
import { ColumnGroupProps } from 'antd/lib/table/ColumnGroup';
import Modal from 'antd/lib/modal';
import { ChatData, Prop } from './componentTypes';

type EditHandle = (data: ChatData) => void;
type DelHandle = (id: string) => void;
type AddKeyWordHandle = (data: ChatData) => void;

/**
 * 表头定义
 */
export function getColumns(
	editHandle: EditHandle,
	delHandle: DelHandle,
	addKeyWordHandle: AddKeyWordHandle
): ColumnGroupProps[] {
	let columns = [
		{
			title: '分类',
			dataIndex: 'sort',
			key: 'sort'
		},
		{
			title: '级别',
			dataIndex: 'level',
			key: 'level',
			width: 80,
			align: 'center'
		},
		{
			title: '添加关键词',
			dataIndex: 'id',
			key: 'id',
			width: 100,
			align: 'center',
			render(value: string, record: ChatData) {
				return (
					<a data-id={value} onClick={() => addKeyWordHandle(record)}>
						添加关键词
					</a>
				);
			}
		},
		{
			title: '编辑',
			dataIndex: 'id',
			key: 'id',
			width: 80,
			align: 'center',
			render(value: string, record: ChatData) {
				return (
					<a
						data-id={value}
						onClick={() => {
							editHandle(record);
						}}>
						编辑
					</a>
				);
			}
		},
		{
			title: '删除',
			dataIndex: 'id',
			key: 'id',
			width: 80,
			align: 'center',
			render(value: string, record: ChatData) {
				return (
					<a
						data-id={value}
						onClick={() => {
							Modal.confirm({
								onOk() {
									delHandle(value);
								},
								title: '删除',
								content: `确认删除「${record.sort}」分类？`,
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
