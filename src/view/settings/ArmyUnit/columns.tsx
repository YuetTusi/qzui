import React from 'react';
import Modal from 'antd/lib/modal';
import { ColumnGroupProps } from 'antd/lib/table/ColumnGroup';
import { ArmyUnitEntity } from '@src/schema/socket/ArmyUnitEntity';

type DelHandleFunc = (id: string) => void;

/**
 * 表头定义
 */
export function getColumns(delHandle: DelHandleFunc): ColumnGroupProps[] {
	let columns = [
		{
			title: '单位名称',
			dataIndex: 'unitName',
			key: 'unitName',
			render(val: string) {
				if (val) {
					return <span>{val}</span>;
				} else {
					return null;
				}
			}
		},
		{
			title: '删除',
			dataIndex: '_id',
			key: 'del',
			width: 60,
			align: 'center',
			render(val: string, record: ArmyUnitEntity) {
				return (
					<a
						data-id={val}
						onClick={async () => {
							Modal.confirm({
								title: '删除单位',
								content: `确认删除「${record.unitName}」？`,
								okText: '是',
								cancelText: '否',
								onOk() {
                                    delHandle(val);
                                }
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
