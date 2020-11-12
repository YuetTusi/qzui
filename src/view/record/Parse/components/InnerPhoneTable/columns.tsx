import path from 'path';
import fs from 'fs';
import { execFile } from 'child_process';
import { remote, OpenDialogReturnValue } from 'electron';
import React from 'react';
import moment from 'moment';
import debounce from 'lodash/debounce';
import Badge from 'antd/lib/badge';
import Button from 'antd/lib/button';
import Tag from 'antd/lib/tag';
import message from 'antd/lib/message';
import Modal from 'antd/lib/modal';
import { ColumnGroupProps } from 'antd/lib/table/ColumnGroup';
import DeviceType from '@src/schema/socket/DeviceType';
import { ParseState } from '@src/schema/socket/DeviceState';
import { TableName } from '@src/schema/db/TableName';
import { UseMode } from '@src/schema/UseMode';
import { helper } from '@src/utils/helper';
import { Prop } from './componentType';

const { shell } = remote;
const appRoot = process.cwd();
type SetDataHandle = (data: DeviceType[]) => void;
type SetLoadingHandle = (loading: boolean) => void;
const getDb = remote.getGlobal('getDb');
const config = helper.readConf();

/**
 * 使用系统窗口打开路径
 */
const openOnSystemWindow = debounce(
	(defaultPath: string) => {
		fs.access(defaultPath, (err) => {
			if (err) {
				message.destroy();
				message.warning('取证数据不存在');
			} else {
				shell.showItemInFolder(defaultPath);
			}
		});
	},
	500,
	{ leading: true, trailing: false }
);

/**
 * 调用exe创建报告
 * @param exePath create_report所在路径
 * @param phonePath 手机路径
 */
const runExeCreateReport = (exePath: string, phonePath: string) => {
	const casePath = path.join(phonePath!, '../../'); //案件路径
	const cwd = path.join(appRoot, '../tools/CreateReport');
	const modal = Modal.info({
		content: '正在生成报告... 请不要关闭程序',
		okText: '确定',
		maskClosable: false,
		okButtonProps: { disabled: true, icon: 'loading' }
	});

	const proc = execFile(exePath, [casePath, phonePath!], {
		cwd,
		windowsHide: false
	});
	proc.once('error', () =>
		modal.update({
			content: '报告生成失败',
			okButtonProps: { disabled: false, icon: 'close-circle' }
		})
	);
	proc.once('exit', () => {
		modal.update({
			content: '报告生成成功',
			okButtonProps: { disabled: false, icon: 'check-circle' }
		});
		setTimeout(() => {
			modal.destroy();
		}, 800);
	});
};

/**
 * 表头定义
 * @param props 组件属性
 */
function getColumns(
	props: Prop,
	setDataHandle: SetDataHandle,
	setLoadingHandle: SetLoadingHandle
): ColumnGroupProps[] {
	const { startParseHandle, progressHandle, openExportReportModalHandle } = props;

	const columns = [
		{
			title: '手机名称',
			dataIndex: 'mobileName',
			key: 'mobileName',
			render(value: string, record: DeviceType) {
				let [name] = value.split('_');
				switch (record.parseState) {
					case ParseState.Fetching:
						return (
							<span>
								<Badge color="silver" />
								<a
									onClick={() => {
										openOnSystemWindow(record.phonePath!);
									}}>
									{name}
								</a>
							</span>
						);
					case ParseState.NotParse:
						return (
							<span>
								<Badge color="silver" />
								<a
									onClick={() => {
										openOnSystemWindow(record.phonePath!);
									}}>
									{name}
								</a>
							</span>
						);
					case ParseState.Finished:
						return (
							<span>
								<Badge color="green" />
								<a
									onClick={() => {
										openOnSystemWindow(record.phonePath!);
									}}>
									{name}
								</a>
							</span>
						);
					case ParseState.Error:
						return (
							<span>
								<Badge color="red" />
								<a
									onClick={() => {
										openOnSystemWindow(record.phonePath!);
									}}>
									{name}
								</a>
							</span>
						);
					case ParseState.Parsing:
						return (
							<span>
								<Badge color="blue" status="processing" />
								<a
									onClick={() => {
										openOnSystemWindow(record.phonePath!);
									}}>
									{name}
								</a>
							</span>
						);
					case ParseState.Exception:
						return (
							<span>
								<Badge color="red" />
								<a
									onClick={() => {
										openOnSystemWindow(record.phonePath!);
									}}>
									{name}
								</a>
							</span>
						);
					default:
						return <span>{name}</span>;
				}
			}
		},
		{
			title: '手机持有人',
			dataIndex: 'mobileHolder',
			key: 'mobileHolder'
		},
		{
			title: '备注',
			dataIndex: 'note',
			key: 'note'
		},
		{
			title: '取证时间',
			dataIndex: 'fetchTime',
			key: 'fetchTime',
			width: '100px',
			align: 'center',
			sorter(m: DeviceType, n: DeviceType) {
				let isAfter = moment(m.fetchTime).isAfter(moment(n.fetchTime));
				return isAfter ? 1 : -1;
			},
			render(value: Date) {
				if (helper.isNullOrUndefined(value)) {
					return helper.EMPTY_STRING;
				} else {
					return moment(value).format('YYYY-M-D HH:mm:ss');
				}
			}
		},
		{
			title: '状态',
			dataIndex: 'parseState',
			key: 'parseState',
			width: '75px',
			align: 'center',
			render(state: ParseState, record: any) {
				switch (state) {
					case ParseState.Fetching:
						return <Tag>采集中</Tag>;
					case ParseState.NotParse:
						return <Tag>未解析</Tag>;
					case ParseState.Parsing:
						return <Tag color="blue">解析中</Tag>;
					case ParseState.Finished:
						return <Tag color="green">完成</Tag>;
					case ParseState.Error:
						return <Tag color="red">失败</Tag>;
					case ParseState.Exception:
						return <Tag color="red">异常</Tag>;
					default:
						return <Tag>未解析</Tag>;
				}
			}
		},
		{
			title: '解析',
			dataIndex: 'parseState',
			key: 'start',
			width: '75px',
			align: 'center',
			render(state: ParseState, record: DeviceType) {
				if (
					helper.isNullOrUndefined(state) ||
					state === ParseState.NotParse ||
					state === ParseState.Error ||
					state === ParseState.Finished
				) {
					return (
						<Button
							type="primary"
							size="small"
							onClick={async () => {
								let exist = await helper.existFile(record.phonePath!);
								if (exist) {
									if (state === ParseState.NotParse) {
										startParseHandle(record);
									} else {
										Modal.confirm({
											title: '重新解析',
											content: '可能所需时间较长，确定重新解析吗？',
											okText: '是',
											cancelText: '否',
											onOk() {
												startParseHandle(record);
											}
										});
									}
								} else {
									message.destroy();
									message.warning('取证数据不存在');
								}
							}}>
							{state === ParseState.Finished || state === ParseState.Error
								? '重新解析'
								: '解析'}
						</Button>
					);
				} else {
					return (
						<Button type="primary" size="small" disabled={true}>
							解析
						</Button>
					);
				}
			}
		},
		{
			title: '详情',
			dataIndex: 'parseState',
			key: 'progress',
			width: '75px',
			align: 'center',
			render(state: ParseState, record: DeviceType) {
				if (state === ParseState.Parsing) {
					return (
						<Button
							type="primary"
							size="small"
							onClick={() => {
								progressHandle(record);
							}}>
							详情
						</Button>
					);
				} else {
					return (
						<Button type="primary" size="small" disabled={true}>
							详情
						</Button>
					);
				}
			}
		},
		{
			title: '查看报告',
			dataIndex: 'parseState',
			key: 'report',
			width: '75px',
			align: 'center',
			render(state: ParseState, { phonePath }: DeviceType) {
				return (
					<Button
						onClick={async () => {
							const treeJsonPath = path.join(
								phonePath!,
								'./report/public/data/tree.json'
							);
							const reportPath = path.join(phonePath!, './report/index.html');
							let exist = await helper.existFile(treeJsonPath);
							if (exist) {
								shell.openPath(reportPath);
							} else {
								message.destroy();
								message.info('未生成报告，请重新生成报告后进行查看');
							}
						}}
						disabled={state !== ParseState.Finished && state !== ParseState.Error}
						type="primary"
						size="small">
						查看报告
					</Button>
				);
			}
		},
		{
			title: '生成报告',
			dataIndex: 'parseState',
			key: 'createReport',
			width: '75px',
			align: 'center',
			render(state: ParseState, { phonePath }: DeviceType) {
				const exe = path.join(appRoot, '../tools/CreateReport/create_report.exe');
				return (
					<Button
						onClick={() => {
							Modal.confirm({
								title: '生成报告',
								content: '可能所需时间较长，确定重新生成报告吗？',
								okText: '是',
								cancelText: '否',
								onOk() {
									runExeCreateReport(exe, phonePath!);
								}
							});
						}}
						disabled={state !== ParseState.Finished && state !== ParseState.Error}
						type="primary"
						size="small">
						生成报告
					</Button>
				);
			}
		},
		{
			title: '导出报告',
			dataIndex: 'parseState',
			key: 'exportReport',
			width: '75px',
			align: 'center',
			render(state: ParseState, device: DeviceType) {
				return (
					<Button
						onClick={async () => {
							const treeJsonPath = path.join(
								device.phonePath!,
								'report/public/data/tree.json'
							);
							try {
								let exist = await helper.existFile(treeJsonPath);
								if (exist) {
									openExportReportModalHandle(device);
								} else {
									message.info('报告数据不存在，请生成报告');
								}
							} catch (error) {
								message.warning('读取报告数据失败，请重新生成报告');
							}
						}}
						disabled={state !== ParseState.Finished && state !== ParseState.Error}
						type="primary"
						size="small">
						导出报告
					</Button>
				);
			}
		},
		{
			title: '生成BCP',
			dataIndex: 'parseState',
			key: 'bcp',
			width: '75px',
			align: 'center',
			render(state: ParseState, record: DeviceType) {
				return (
					<Button
						onClick={() => {
							props.toBcpHandle(record, record.caseId!);
						}}
						disabled={
							state === ParseState.NotParse ||
							state === ParseState.Fetching ||
							state === ParseState.Parsing ||
							state === ParseState.Exception
						}
						type="primary"
						size="small">
						生成BCP
					</Button>
				);
			}
		},
		{
			title: '导出BCP',
			dataIndex: 'parseState',
			key: 'export',
			width: '75px',
			align: 'center',
			render(state: ParseState, record: DeviceType) {
				const bcpPath = path.join(record.phonePath!);
				try {
					fs.accessSync(bcpPath);
					let dirs: string[] = fs.readdirSync(bcpPath);
					return (
						<Button
							type="primary"
							size="small"
							disabled={!dirs.includes('BCP')}
							onClick={() => {
								remote.dialog
									.showOpenDialog({
										title: '导出BCP',
										properties: ['openFile'],
										defaultPath: path.join(bcpPath, 'BCP'),
										filters: [{ name: 'BCP文件', extensions: ['zip'] }]
									})
									.then((value: OpenDialogReturnValue) => {
										if ((value.filePaths as string[]).length > 0) {
											window.location.href = value.filePaths[0];
										}
									});
							}}>
							导出BCP
						</Button>
					);
				} catch (error) {
					return (
						<Button type="primary" size="small" disabled={true}>
							导出BCP
						</Button>
					);
				}
			}
		},
		{
			title: '编辑',
			dataIndex: 'parseState',
			key: 'edit',
			width: '60px',
			align: 'center',
			render(state: ParseState, record: DeviceType) {
				if (state === ParseState.Parsing || state === ParseState.Fetching) {
					return <span style={{ cursor: 'not-allowed' }}>编辑</span>;
				} else {
					return (
						<a
							onClick={() => {
								props.editHandle(record);
							}}>
							编辑
						</a>
					);
				}
			}
		},
		{
			title: '删除',
			dataIndex: 'parseState',
			key: 'del',
			width: '60px',
			align: 'center',
			render(state: ParseState, record: DeviceType) {
				if (state === ParseState.Parsing || state === ParseState.Fetching) {
					return <span style={{ cursor: 'not-allowed' }}>删除</span>;
				} else {
					return (
						<a
							onClick={() => {
								Modal.confirm({
									title: `删除「${record.mobileName?.split('_')[0]}」数据`,
									content: `确认删除该取证数据吗？`,
									okText: '是',
									cancelText: '否',
									async onOk() {
										const deviceDb = getDb(TableName.Device);
										const bcpHistoryDb = getDb(TableName.CreateBcpHistory);
										const modal = Modal.info({
											content: '正在删除，请不要关闭程序',
											okText: '确定',
											maskClosable: false,
											okButtonProps: { disabled: true, icon: 'loading' }
										});
										try {
											setLoadingHandle(true);
											let success = await helper.delDiskFile(
												record.phonePath!
											);
											if (success) {
												modal.update({
													content: '删除成功',
													okButtonProps: {
														disabled: false,
														icon: 'check-circle'
													}
												});
												//NOTE:磁盘文件删除成功后，删除设备及BCP历史记录
												await Promise.all([
													deviceDb.remove({ _id: record._id }),
													bcpHistoryDb.remove(
														{ deviceId: record.id },
														true
													)
												]);
												let next: DeviceType[] = await deviceDb.find({
													caseId: record.caseId
												});
												setDataHandle(
													next.sort((m, n) =>
														moment(m.fetchTime).isBefore(n.fetchTime)
															? 1
															: -1
													)
												);
											} else {
												modal.update({
													title: '删除失败',
													content: '可能文件仍被占用，请稍后再试',
													okButtonProps: {
														disabled: false,
														icon: 'check-circle'
													}
												});
											}
											setTimeout(() => {
												modal.destroy();
											}, 1000);
										} catch (error) {
											console.log(
												`@view/CaseData/InnerPhoneTable/columns: ${error.message}`
											);
											modal.update({
												title: '删除失败',
												content: '可能文件仍被占用，请稍后再试',
												okButtonProps: {
													disabled: false,
													icon: 'check-circle'
												}
											});
											setTimeout(() => {
												modal.destroy();
											}, 1000);
										} finally {
											setLoadingHandle(false);
										}
									}
								});
							}}>
							删除
						</a>
					);
				}
			}
		}
	];

	if (config.useMode === UseMode.Army) {
		//部队版本移除BCP相关列
		return columns.filter((item: ColumnGroupProps) => !(item.title as string).includes('BCP'));
	} else {
		return columns;
	}
}

export { getColumns };
