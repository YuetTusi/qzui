import path from 'path';
import React, { MouseEvent } from 'react';
import { routerRedux } from 'dva/router';
import moment from 'moment';
// import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
// import { faBolt } from '@fortawesome/free-solid-svg-icons';
import Icon from 'antd/lib/icon';
import Tag from 'antd/lib/tag';
import Modal from 'antd/lib/modal';
import { Dispatch } from 'redux';
import CCaseInfo, { CaseType } from '@src/schema/CCaseInfo';
import { ColumnGroupProps } from 'antd/lib/table/ColumnGroup';
import DeviceType from '@src/schema/socket/DeviceType';
import { helper } from '@utils/helper';
import { Context } from './componentType';

const config = helper.readConf();

/**
 * 表头定义
 * @param dispatch 派发方法
 */
export function getColumns<T>(dispatch: Dispatch<T>, ctx: Context): ColumnGroupProps[] {
	let columns = [
		{
			title: `${config.caseText ?? '案件'}名称`,
			dataIndex: 'm_strCaseName',
			key: 'm_strCaseName',
			render: (cell: string, record: CCaseInfo) => {
				switch (record.caseType) {
					case CaseType.QuickCheck:
						return <span
							onClick={async (event: MouseEvent) => {
								event.stopPropagation();
								let nextHttp = 9900;
								let nextService = 57999;
								const allowIp = ['192.168.137.1', '192.168.50.99', '192.168.191.1'].reduce<string[]>((acc, current) => {
									if (helper.hasIP(current)) {
										acc.push(current);
									}
									return acc;
								}, []);
								try {
									[nextHttp, nextService] = await Promise.all([
										helper.portStat(9900),
										helper.portStat(57999)
									]);
								} catch (err) {
									console.log(err);
								}

								if (nextHttp !== 9900 || nextService !== 57999) {
									Modal.warn({
										title: '端口占用',
										content: '点验端口已被其他服务占用，请检查',
										okText: '确定'
									});
								} else if (allowIp.length === 0) {
									Modal.warn({
										title: '生成二维码失败',
										content: '未检测到热点或路由器, 请连接采集盒子或者打开电脑上的移动热点',
										okText: '确定'
									});
								} else {
									(ctx as any).setState({
										ip: allowIp[0],
										checkCaseId: record._id
									});
									dispatch({ type: 'caseData/setCheckCaseId', payload: record._id });
								}
							}}
							className="case-name-box"
							title="快速点验">
							{cell.includes('_') ? cell.split('_')[0] : cell}
							「扫码:<Icon type="qrcode" />」
						</span>;
					default:
						return <span>{cell.includes('_') ? cell.split('_')[0] : cell}</span>;
				}
			}
		},
		{
			title: `备用${config.caseText ?? '案件'}名称`,
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
			title: `自动${config.parseText ?? '解析'}`,
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
		// {
		// 	title: 'BCP包含附件',
		// 	dataIndex: 'attachment',
		// 	key: 'attachment',
		// 	width: '80px',
		// 	align: 'center',
		// 	render: (val: boolean) =>
		// 		val ? <Tag color="green">是</Tag> : <Tag color="red">否</Tag>
		// },
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
			dataIndex: '_id',
			key: 'edit',
			width: '65px',
			align: 'center',
			render: (id: string, { caseType }: CCaseInfo) => {
				return (
					<a
						onClick={(e: MouseEvent<HTMLAnchorElement>) => {
							e.stopPropagation();
							if (caseType === CaseType.QuickCheck) {
								ctx.openCheckQRCodeHandle(id);
							} else {
								dispatch(routerRedux.push(`/case/case-edit/${id}`));
							}
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
								content: `${config.caseText ?? '案件'}下${config.fetchText ?? '取证'}数据将一并删除，确认吗？`,
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
