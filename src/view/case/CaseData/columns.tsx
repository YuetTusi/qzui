import path from 'path';
import React, { MouseEvent } from 'react';
import { routerRedux } from 'dva/router';
import moment from 'moment';
import Tag from 'antd/lib/tag';
import Modal from 'antd/lib/modal';
import { Dispatch } from 'redux';
import CCaseInfo from '@src/schema/CCaseInfo';
import { ColumnGroupProps } from 'antd/lib/table/ColumnGroup';
import DeviceType from '@src/schema/socket/DeviceType';
import { helper } from '@src/utils/helper';

const config = helper.readConf();

/**
 * 表头定义
 * @param dispatch 派发方法
 */
export function getColumns<T>(dispatch: Dispatch<T>): ColumnGroupProps[] {
	let columns = [
		{
			title: '案件名称',
			dataIndex: 'm_strCaseName',
			key: 'm_strCaseName',
			render: (cell: string) => {
				return cell.includes('_') ? cell.split('_')[0] : cell;
			}
		},
		{
			title: '备用案件名称',
			dataIndex: 'spareName',
			key: 'spareName'
		},
		{
			title: '拉取SD卡',
			dataIndex: 'sdCard',
			key: 'sdCard',
			width: '80px',
			align: 'center',
			render: (val: boolean) =>
				val ? <Tag color="green">是</Tag> : <Tag color="red">否</Tag>
		},
		{
			title: '生成报告',
			dataIndex: 'hasReport',
			key: 'hasReport',
			width: '80px',
			align: 'center',
			render: (val: boolean) =>
				val ? <Tag color="green">是</Tag> : <Tag color="red">否</Tag>
		},
		{
			title: '自动解析',
			dataIndex: 'm_bIsAutoParse',
			key: 'm_bIsAutoParse',
			width: '80px',
			align: 'center',
			render: (val: boolean) =>
				val ? <Tag color="green">是</Tag> : <Tag color="red">否</Tag>
		},
		{
			title: '自动生成BCP',
			dataIndex: 'generateBcp',
			key: 'generateBcp',
			width: '80px',
			align: 'center',
			render: (val: boolean) =>
				val ? <Tag color="green">是</Tag> : <Tag color="red">否</Tag>
		},
		{
			title: 'BCP包含附件',
			dataIndex: 'attachment',
			key: 'attachment',
			width: '80px',
			align: 'center',
			render: (val: boolean) =>
				val ? <Tag color="green">是</Tag> : <Tag color="red">否</Tag>
		},
		{
			title: '删除原数据',
			dataIndex: 'isDel',
			key: 'isDel',
			width: '80px',
			align: 'center',
			render: (val: boolean) =>
				val ? <Tag color="green">是</Tag> : <Tag color="red">否</Tag>
		},
		{
			title: 'AI分析',
			dataIndex: 'isAi',
			key: 'isAi',
			width: '80px',
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
			title: '编辑',
			key: 'edit',
			width: '65px',
			align: 'center',
			render: (cell: any, record: CCaseInfo) => {
				return (
					<a
						onClick={(e: MouseEvent<HTMLAnchorElement>) => {
							e.stopPropagation();
							dispatch(routerRedux.push(`/case/case-edit/${record._id!}`));
						}}>
						编辑
					</a>
				);
			}
		},
		{
			title: '删除',
			key: 'del',
			width: '65px',
			align: 'center',
			render: (cell: any, record: CCaseInfo) => {
				let pos = record.m_strCaseName.lastIndexOf('\\');
				let end = record.m_strCaseName.lastIndexOf('_');
				let caseName = record.m_strCaseName.substring(pos + 1, end);
				return (
					<a
						onClick={(e: MouseEvent<HTMLAnchorElement>) => {
							e.stopPropagation();
							Modal.confirm({
								title: `删除「${caseName}」`,
								content: `案件下取证数据将一并删除，确认吗？`,
								okText: '是',
								cancelText: '否',
								onOk() {
									dispatch({ type: 'caseData/setLoading', payload: true });
									dispatch({
										type: 'caseData/deleteCaseData',
										payload: {
											id: record._id,
											casePath: path.join(
												record.m_strCasePath,
												record.m_strCaseName
											)
										}
									});
								}
							});
						}}>
						删除
					</a>
				);
			}
		}
	];

	if (!config.useBcp) {
		//?根据配置隐藏BCP相关列
		columns = columns.filter((item) => !item.title.includes('BCP'));
	}
	if (!config.useAi) {
		//?根据配置隐藏AI相关列
		columns = columns.filter((item) => !item.title.includes('AI'));
	}
	return columns;
}
