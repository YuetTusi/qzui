import React, { MouseEvent } from 'react';
import { Dispatch } from 'redux';
import moment from 'moment';
import { ColumnProps } from 'antd/lib/table';
import Modal from 'antd/lib/modal';
import { helper } from '@utils/helper';
import { CloudLog } from '@src/schema/socket/CloudLog';

const { caseText } = helper.readConf();

/**
 * 列头
 * @param dispatch 派发方法
 * @param isAdmin 是否以管理员方式显示
 */
const getColumns = (dispatch: Dispatch<any>, isAdmin: boolean): ColumnProps<CloudLog>[] => {
	let cols: ColumnProps<CloudLog>[] = [
		{
			title: '手机名称',
			dataIndex: 'mobileName',
			key: 'mobileName',
			render(val: string, record: CloudLog) {
				if (helper.isNullOrUndefined(val)) {
					return '';
				} else {
					let [caseName] = val.split('_');
					return <span>{caseName}</span>;
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
			title: '手机号',
			dataIndex: 'mobileNumber',
			key: 'mobileNumber',
			align: 'center',
			width: 120,
			render(val?: string) {
				if (helper.isNullOrUndefined(val)) {
					return '';
				} else {
					return val;
				}
			}
		},
		{
			title: '手机编号',
			dataIndex: 'mobileNo',
			key: 'mobileNo',
			width: 75,
			render(val?: string) {
				if (helper.isNullOrUndefined(val)) {
					return '';
				} else {
					return val;
				}
			}
		},
		{
			title: `${caseText ?? '案件'}名称`,
			dataIndex: 'caseName',
			key: 'caseName'
		},
		{
			title: '备注',
			dataIndex: 'note',
			key: 'note',
			// width: 140,
			render(val?: string) {
				if (helper.isNullOrUndefined(val)) {
					return '';
				} else {
					return val;
				}
			}
		},
		{
			title: '采集时间',
			dataIndex: 'fetchTime',
			key: 'fetchTime',
			width: 150,
			align: 'center',
			sorter(a, b) {
				let isAfter = moment(a.fetchTime).isAfter(moment(b.fetchTime));
				return isAfter ? 1 : -1;
			},
			render(fetchTime: Date) {
				if (helper.isNullOrUndefined(fetchTime)) {
					return '';
				} else {
					return moment(fetchTime).format('YYYY-MM-DD HH:mm:ss');
				}
			}
		},
		{
			title: '采集记录',
			dataIndex: '_id',
			key: 'detail',
			width: 100,
			align: 'center',
			render(id: string, { apps }: CloudLog) {
				return (
					<a
						onClick={(e: MouseEvent<HTMLAnchorElement>) => {
							e.stopPropagation();
							dispatch({ type: 'cloudLog/setDetailVisible', payload: true });
							dispatch({ type: 'cloudLog/setApps', payload: apps });
						}}>
						采集记录
					</a>
				);
			}
		},
		{
			title: '删除',
			dataIndex: '_id',
			key: 'del',
			width: 70,
			align: 'center',
			render(id: string) {
				return (
					<a
						onClick={(e: MouseEvent<HTMLAnchorElement>) => {
							e.stopPropagation();
							Modal.confirm({
								title: '删除确认',
								content: '日志将删除，确认吗？',
								okText: '确定',
								cancelText: '取消',
								onOk() {
									dispatch({ type: 'cloudLog/dropById', payload: id });
								}
							});
						}}>
						删除
					</a>
				);
			}
		}
	];

	if (!isAdmin) {
		cols.pop();
	}

	return cols;
};

export { getColumns };
