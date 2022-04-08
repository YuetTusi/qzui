import path from 'path';
import { execFile } from 'child_process';
import React, { MouseEvent } from 'react';
import { Dispatch } from 'redux';
import moment from 'moment';
import Tag from 'antd/lib/tag';
import Modal from 'antd/lib/modal';
import { ColumnGroupProps } from 'antd/lib/table/ColumnGroup';
import DeviceType from '@src/schema/socket/DeviceType';
import CCaseInfo from '@src/schema/CCaseInfo';
import { helper } from '@utils/helper';
import { Context } from './componentType';
import { AlarmMessageInfo } from '@src/components/AlarmMessage/componentType';
import message from 'antd/lib/message';
import { ipcRenderer } from 'electron';
import { TableName } from '@src/schema/db/TableName';
import logger from '@src/utils/log';
import notification from 'antd/lib/notification';

const appPath = process.cwd();
const config = helper.readConf();

/**
 * 调用exe创建报告
 * @param props 组件属性
 * @param exePath create_report.exe所在路径
 * @param caseData 案件
 */
const runExeCreateReport = async (dispatch: Dispatch<any>, exePath: string, caseData: CCaseInfo) => {
	const { _id, m_strCasePath, m_strCaseName } = caseData; //案件路径
	const cwd = path.join(appPath, '../tools/CreateReport');

	try {
		const devList: DeviceType[] = await ipcRenderer.invoke('db-find', TableName.Device, { caseId: _id });
		if (devList.length === 0) {
			message.destroy();
			message.info('无设备数据');
		} else {
			const msg = new AlarmMessageInfo({
				id: helper.newId(),
				msg: `正在批量生成「${`${m_strCaseName.split('_')[0]}`}」报告`
			});
			message.info('开始生成报告');
			dispatch({
				type: 'dashboard/addAlertMessage',
				payload: msg
			}); //显示全局消息
			dispatch({
				type: 'innerPhoneTable/addCreatingDeviceId',
				payload: devList.map(item => item.id)
			});

			console.log(m_strCasePath);
			console.log(devList.map(item => item.phonePath).join('|'));

			const proc = execFile(exePath, [m_strCasePath, devList.map(item => item.phonePath).join('|')], {
				cwd,
				windowsHide: false
			});
			proc.once('error', () => {
				message.destroy();
				notification.error({
					type: 'error',
					message: '报告生成失败',
					description: '批量生成报告失败',
					duration: 0
				});
				dispatch({
					type: 'dashboard/removeAlertMessage',
					payload: msg.id
				});
				dispatch({
					type: 'innerPhoneTable/clearCreatingDeviceId'
				});
			});
			proc.once('exit', () => {
				message.destroy();
				notification.success({
					type: 'success',
					message: '报告批量生成成功',
					description: `「${`${m_strCaseName.split('_')[0]}`}」报告生成成功`,
					duration: 0
				});
				dispatch({
					type: 'dashboard/removeAlertMessage',
					payload: msg.id
				});
				dispatch({
					type: 'innerPhoneTable/clearCreatingDeviceId'
				});
				ipcRenderer.send('show-progress', false);
			});
		}
	} catch (error) {
		logger.error(
			`写入JSON失败 @view/record/Parse/components/InnerPhoneTable/columns.tsx: ${error.message}`
		);
	}
};

/**
 * 表头定义
 * @param dispatch 派发方法
 */
export function getColumns<T>(dispatch: Dispatch<T>, context: Context): ColumnGroupProps[] {
	let columns = [
		{
			title: '案件名称',
			dataIndex: 'm_strCaseName',
			key: 'm_strCaseName',
			render: (cell: string) => (cell.includes('_') ? cell.split('_')[0] : cell)
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
			title: '生成报告',
			dataIndex: '_id',
			key: 'exportReport',
			width: '90px',
			align: 'center',
			render(id: string, record: CCaseInfo) {
				const exe = path.join(appPath, '../tools/CreateReport/create_report.exe');
				const { creatingDeviceId } = context.props.innerPhoneTable;
				if (creatingDeviceId.length === 0) {
					return <a
						onClick={(e: MouseEvent<HTMLAnchorElement>) => {
							e.stopPropagation();
							Modal.confirm({
								title: '批量生成报告',
								content: '所需时间较长，确定批量生成报告吗？',
								okText: '是',
								cancelText: '否',
								onOk() {
									runExeCreateReport(dispatch, exe, record);
								}
							});
						}}>
						生成报告
					</a>;
				} else {
					return <span style={{ cursor: 'not-allowed' }}>生成报告</span>
				}
			}
		},
		{
			title: '导出报告',
			dataIndex: '_id',
			key: 'exportReport',
			width: '90px',
			align: 'center',
			render(id: string, record: CCaseInfo) {
				const { exportingDeviceId } = context.props.innerPhoneTable;
				return exportingDeviceId.length === 0 ? (
					<a
						onClick={(e: MouseEvent<HTMLAnchorElement>) => {
							e.stopPropagation();
							dispatch({
								type: 'batchExportReportModal/queryDevicesByCaseId',
								payload: id
							});
							context.batchExportReportModalVisibleChange(true);
						}}>
						导出报告
					</a>
				) : (
					<span style={{ cursor: 'not-allowed' }}>导出报告</span>
				);
			}
		},
		{
			title: '导出BCP',
			dataIndex: '_id',
			key: 'exportBcp',
			width: '90px',
			align: 'center',
			render(id: string, record: CCaseInfo) {
				return (
					<a
						onClick={(e: MouseEvent<HTMLAnchorElement>) => {
							e.stopPropagation();
							dispatch({ type: 'exportBcpModal/setIsBatch', payload: true });
							dispatch({ type: 'exportBcpModal/setExportBcpCase', payload: record });
							context.exportBcpModalVisibleChange(true);
						}}>
						导出BCP
					</a>
				);
			}
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
