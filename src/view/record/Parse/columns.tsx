import path from 'path';
import React, { MouseEvent } from 'react';
import moment from 'moment';
import Tag from 'antd/lib/tag';
import Modal from 'antd/lib/modal';
import { Dispatch } from 'redux';
import { ColumnGroupProps } from 'antd/lib/table/ColumnGroup';
import { UseMode } from '@src/schema/UseMode';
import DeviceType from '@src/schema/socket/DeviceType';
import CCaseInfo from '@src/schema/CCaseInfo';
import { helper } from '@src/utils/helper';

const config = helper.readConf();

/**
 * 表头定义
 * @param dispatch 派发方法
 */
export function getColumns<T>(dispatch: Dispatch<T>): ColumnGroupProps[] {
	const columns = [
		{
			title: '案件名称',
			dataIndex: 'm_strCaseName',
			key: 'm_strCaseName',
			render: (cell: string) => (cell.includes('_') ? cell.split('_')[0] : cell)
		},
		{
			title: '拉取SD卡',
			dataIndex: 'sdCard',
			key: 'sdCard',
			width: '95px',
			align: 'center',
			render: (val: boolean) =>
				val ? <Tag color="green">是</Tag> : <Tag color="red">否</Tag>
		},
		{
			title: '生成报告',
			dataIndex: 'hasReport',
			key: 'hasReport',
			width: '90px',
			align: 'center',
			render: (val: boolean) =>
				val ? <Tag color="green">是</Tag> : <Tag color="red">否</Tag>
		},
		{
			title: '自动解析',
			dataIndex: 'm_bIsAutoParse',
			key: 'm_bIsAutoParse',
			width: '90px',
			align: 'center',
			render: (val: boolean) =>
				val ? <Tag color="green">是</Tag> : <Tag color="red">否</Tag>
		},
		{
			title: '自动生成BCP',
			dataIndex: 'generateBcp',
			key: 'generateBcp',
			width: '120px',
			align: 'center',
			render: (val: boolean) =>
				val ? <Tag color="green">是</Tag> : <Tag color="red">否</Tag>
		},
		{
			title: 'BCP包含附件',
			dataIndex: 'attachment',
			key: 'attachment',
			width: '115px',
			align: 'center',
			render: (val: boolean) =>
				val ? <Tag color="green">是</Tag> : <Tag color="red">否</Tag>
		},
		{
			title: '删除原数据',
			dataIndex: 'isDel',
			key: 'isDel',
			width: '105px',
			align: 'center',
			render: (val: boolean) =>
				val ? <Tag color="green">是</Tag> : <Tag color="red">否</Tag>
		},
		{
			title: '创建时间',
			dataIndex: 'cTime',
			key: 'cTime',
			width: '160px',
			align: 'center',
			sorter: (m: DeviceType, n: DeviceType) =>
				moment(m.createdAt).isAfter(moment(n.createdAt)) ? 1 : -1,
			render: (val: any, record: DeviceType) =>
				moment(record.createdAt).format('YYYY-MM-DD HH:mm:ss')
		},
		{
			title: '删除',
			dataIndex: '_id',
			key: 'del',
			width: '65px',
			align: 'center',
			render: (id: string, record: CCaseInfo) => (
				<a
					onClick={(e: MouseEvent<HTMLAnchorElement>) => {
						e.stopPropagation();
						const casePath = path.join(record.m_strCasePath, record.m_strCaseName);
						const [caseName] = record.m_strCaseName.split('_');
						Modal.confirm({
							title: `删除「${caseName}」`,
							content: `请确认所有设备解析完成`,
							okText: '是',
							cancelText: '否',
							onOk() {
								dispatch({
									type: 'parse/deleteCaseData',
									payload: {
										id: record._id,
										casePath
									}
								});
							}
						});
					}}>
					删除
				</a>
			)
		}
	];

	if (config.useMode === UseMode.Army) {
		//?军队版隐藏BCP和附件列
		return columns.filter(
			(item: any) => !(item.title === '生成BCP' || item.title === '包含附件')
		);
	} else {
		return columns;
	}
}
