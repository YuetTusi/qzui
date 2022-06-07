import React, { MouseEvent } from 'react';
import { Dispatch } from 'redux';
import moment from 'moment';
import { ColumnProps } from 'antd/lib/table';
import Tag from 'antd/lib/tag';
import Modal from 'antd/lib/modal';
import ParseLogEntity from '@src/schema/socket/ParseLog';
import { ParseState } from '@src/schema/socket/DeviceState';
import { helper } from '@utils/helper';

const { caseText } = helper.readConf();

/**
 *
 * @param dispatch 派发方法
 * @param isAdmin 是否以管理员方式显示
 */
const getColumns = (dispatch: Dispatch<any>, isAdmin: boolean): ColumnProps<ParseLogEntity>[] => {
	let cols: ColumnProps<ParseLogEntity>[] = [
		{
			title: '手机名称',
			dataIndex: 'mobileName',
			key: 'mobileName',
			render(val: string, record: ParseLogEntity) {
				if (helper.isNullOrUndefined(val)) {
					return '';
				} else {
					let caseName = val.split('_')[0];
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
			title: '解析开始时间',
			dataIndex: 'startTime',
			key: 'startTime',
			width: 160,
			align: 'center',
			sorter(a, b) {
				let isAfter = moment(a.startTime).isAfter(moment(b.startTime));
				return isAfter ? 1 : -1;
			},
			render(startTime?: Date) {
				if (helper.isNullOrUndefined(startTime)) {
					return '';
				} else {
					return moment(startTime).format('YYYY-MM-DD HH:mm:ss');
				}
			}
		},
		{
			title: '解析完成时间',
			dataIndex: 'endTime',
			key: 'endTime',
			width: 160,
			align: 'center',
			sorter(a, b) {
				let isAfter = moment(a.endTime).isAfter(moment(b.endTime));
				return isAfter ? 1 : -1;
			},
			render(endTime?: Date) {
				if (helper.isNullOrUndefined(endTime)) {
					return '';
				} else {
					return moment(endTime).format('YYYY-MM-DD HH:mm:ss');
				}
			}
		},
		{
			title: '状态',
			dataIndex: 'state',
			key: 'state',
			width: 70,
			align: 'center',
			render(state: ParseState, record: ParseLogEntity) {
				switch (state) {
					case ParseState.NotParse:
						return (
							<Tag color="silver" style={{ marginRight: 0 }}>
								未解析
							</Tag>
						);
					case ParseState.Parsing:
						return (
							<Tag color="blue" style={{ marginRight: 0 }}>
								解析中
							</Tag>
						);
					case ParseState.Finished:
						return (
							<Tag color="green" style={{ marginRight: 0 }}>
								完成
							</Tag>
						);
					case ParseState.Error:
						return (
							<Tag color="red" style={{ marginRight: 0 }}>
								失败
							</Tag>
						);
				}
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
									dispatch({ type: 'parseLog/dropById', payload: id });
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
