import React, { MouseEvent } from 'react';
import Modal from 'antd/lib/modal';
import { ColumnGroupProps } from 'antd/lib/table/ColumnGroup';
import { SortData } from '../SortModal/SortModal';

type Handle = {
	addPackageHandle: (arg0: SortData) => void;
	editSortHandle: (arg0: SortData) => void;
	delSortHandle: (arg0: SortData) => void;
};

/**
 * 列头定义
 */
function getColumns({
	addPackageHandle,
	editSortHandle,
	delSortHandle
}: Handle): ColumnGroupProps[] {
	const columns = [
		{
			title: '分类',
			dataIndex: 'sort',
			key: 'sort'
		},
		{
			title: '风险级别',
			dataIndex: 'level',
			key: 'level',
			width: 100,
			align: 'center'
		},
		{
			title: '添加应用',
			dataIndex: 'id',
			key: 'id',
			width: 100,
			align: 'center',
			render(value: string, record: SortData) {
				return (
					<a
						data-id={value}
						onClick={(e: MouseEvent<HTMLAnchorElement>) => {
							e.stopPropagation();
							addPackageHandle(record);
						}}>
						添加应用
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
			render(value: string, record: SortData) {
				return (
					<a
						data-id={value}
						onClick={(e: MouseEvent<HTMLAnchorElement>) => {
							e.stopPropagation();
							editSortHandle(record);
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
			render(value: string, record: SortData) {
				return (
					<a
						data-id={value}
						onClick={(e: MouseEvent<HTMLAnchorElement>) => {
							e.stopPropagation();
							Modal.confirm({
								onOk() {
									delSortHandle(record);
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

export { getColumns };
