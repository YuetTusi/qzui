import React from 'react';
import moment from 'moment';
import Tag from 'antd/lib/tag';
import { ColumnProps } from 'antd/lib/table';
import FetchLogEntity from '@src/schema/socket/FetchLog';
import { helper } from '@utils/helper';
import { FetchState } from '@src/schema/socket/DeviceState';

/**
 * 表头定义
 * @param context this上下文
 */
function getColumns(context: any): ColumnProps<FetchLogEntity>[] {
	const columns: ColumnProps<FetchLogEntity>[] = [
		{
			title: '手机名称',
			dataIndex: 'mobileName',
			key: 'mobileName',
			render(text: string, record: FetchLogEntity) {
				if (helper.isNullOrUndefined(text)) {
					return <span className="oneline">{text}</span>;
				} else {
					return <span className="oneline">{text.split('_')[0]}</span>;
				}
			}
		},
		{
			title: '手机持有人',
			dataIndex: 'mobileHolder',
			key: 'mobileHolder',
			width: 140
		},
		{
			title: '手机编号',
			dataIndex: 'mobileNo',
			key: 'mobileNo',
			width: 75
		},
		{
			title: '案件名称',
			dataIndex: 'caseName',
			key: 'caseName',
			render(value: string, record: FetchLogEntity) {
				return <span>{value ?? ''}</span>;
			}
		},
		{
			title: '备注',
			dataIndex: 'note',
			key: 'note'
			// width: 160
		},
		{
			title: '采集时间',
			dataIndex: 'fetchTime',
			key: 'fetchTime',
			width: 160,
			align: 'center',
			sorter(m: FetchLogEntity, n: FetchLogEntity) {
				return moment(m.createdAt).isAfter(n.createdAt) ? 1 : -1;
			},
			render(value: Date, record: FetchLogEntity) {
				if (helper.isNullOrUndefined(record)) {
					return null;
				} else {
					return <span>{moment(value).format('YYYY-MM-DD HH:mm:ss')}</span>;
				}
			}
		},
		{
			title: '状态',
			dataIndex: 'state',
			key: 'state',
			align: 'center',
			width: 80,
			render(value: FetchState) {
				switch (value) {
					case FetchState.Finished:
						return <Tag color="green">成功</Tag>;
					case FetchState.HasError:
						return <Tag color="red">异常</Tag>;
					default:
						return <Tag>完成</Tag>;
				}
			}
		},
		{
			title: '采集记录',
			dataIndex: 'record',
			key: 'record',
			align: 'center',
			width: 100,
			render(value: any, log: FetchLogEntity) {
				return (
					<a
						onClick={() => {
							context.showRecordModalHandle(log.record);
						}}>
						采集记录
					</a>
				);
			}
		},
		{
			title: '删除',
			dataIndex: 'del',
			key: 'del',
			align: 'center',
			width: 60,
			render(value: any, log: FetchLogEntity) {
				return (
					<a
						onClick={() => {
							context.dropById(log._id);
						}}>
						删除
					</a>
				);
			}
		}
	];

	if (!context.isAdmin) {
		columns.pop();
	}

	return columns;
}

export { getColumns };
