import path from 'path';
import { ipcRenderer } from 'electron';
import React, { FC, MouseEvent } from 'react';
import { connect } from 'dva';
import moment from 'moment';
import Button from 'antd/lib/button';
import message from 'antd/lib/message';
import Modal from 'antd/lib/modal';
import { ParseState } from '@src/schema/socket/DeviceState';
import DeviceType from '@src/schema/socket/DeviceType';
import { TableName } from '@src/schema/db/TableName';
import { DataMode } from '@src/schema/DataMode';
import { CloudApp } from '@src/schema/CloudApp';
import { SocketType, CommandType } from '@src/schema/socket/command';
import { helper } from '@utils/helper';
import { send } from '@src/service/tcpServer';
import { StateTree } from '@src/type/model';
import { LoginState } from '@src/model/settings/TraceLogin';
import { Prop } from './componentType';

const appRoot = process.cwd();
const { useTraceLogin } = helper.readConf();
const { Group } = Button;
const { Trace } = SocketType;
const wpsAppId = '1280028';
const baiduDiskAppId = '1280015';

/**
 * 云应用列表中是否存在目标应用
 * @param id 云取应用id
 * @param cloudAppList 云取应用列表
 * @returns {boolean} true为存在
 */
const hasCloudApp = (id: string, cloudAppList?: CloudApp[]) => {
	if (cloudAppList) {
		return cloudAppList.some((app) => app.m_strID === id);
	} else {
		return false;
	}
};

/**
 * 是否可以显示打开网盘应用
 * @param parseState 解析状态
 * @param deviceData 设备数据
 * @param appId 应用id
 * @returns 是否可用
 */
const hideOpenDisk = (parseState: ParseState, deviceData: DeviceType, appId: string) =>
	parseState === ParseState.NotParse ||
	parseState === ParseState.Parsing ||
	parseState === ParseState.Fetching ||
	deviceData.mode !== DataMode.ServerCloud ||
	!hasCloudApp(appId, deviceData.cloudAppList); //1280015

/**
 * 根据状态是否可以编辑或删除
 * @param parseState 解析状态
 * @returns 是否可用
 */
const disableEditOrDel = (parseState: ParseState) =>
	parseState === ParseState.Parsing || parseState === ParseState.Fetching;

const Buttons: FC<Prop> = ({
	traceLogin,
	parseState,
	deviceData,
	innerPhoneTableProp,
	setDataHandle,
	setLoadingHandle
}) => {
	/**
	 * App安装记录Click
	 */
	const onGenerageAppClick = (event: MouseEvent<HTMLButtonElement>) => {
		event.preventDefault();
		send(Trace, {
			type: Trace,
			cmd: CommandType.AppRec,
			msg: { phonePath: deviceData.phonePath }
		});
	};

	/**
	 * App记录查看Click
	 */
	const onDisplayAppClick = (event: MouseEvent<HTMLButtonElement>) => {};

	return (
		<Group>
			{useTraceLogin ? (
				<>
					<Button
						onClick={onGenerageAppClick}
						disabled={traceLogin?.loginState !== LoginState.IsLogin}
						size="small"
						type="primary">
						App安装记录
					</Button>
					<Button
						onClick={onDisplayAppClick}
						disabled={traceLogin?.loginState !== LoginState.IsLogin}
						size="small"
						type="primary">
						App记录查看
					</Button>
				</>
			) : null}
			<Button
				onClick={() => {
					const doHide = message.loading('正在打开百度网盘，请稍等...', 0);
					let p = helper.runProc('web_selenium.exe', path.join(appRoot, '../yq'), [
						'-i',
						deviceData.phonePath ?? '',
						'-a',
						baiduDiskAppId
					]);
					p.once('error', () => doHide());
					p.once('close', () => doHide());
					p.once('exit', () => doHide());
					setTimeout(() => {
						doHide();
					}, 5000);
				}}
				style={{
					display: hideOpenDisk(parseState, deviceData, baiduDiskAppId)
						? 'none'
						: 'inline-block'
				}}
				size="small"
				type="primary">
				打开百度网盘
			</Button>
			<Button
				onClick={() => {
					const doHide = message.loading('正在打开WPS云盘，请稍等...', 0);

					console.log(path.join(appRoot, '../yq/web_selenium.exe'));
					console.log(['-i', deviceData.phonePath ?? '', '-a', wpsAppId]);

					let p = helper.runProc('web_selenium.exe', path.join(appRoot, '../yq'), [
						'-i',
						deviceData.phonePath ?? '',
						'-a',
						wpsAppId
					]);
					p.once('error', () => doHide());
					p.once('close', () => doHide());
					p.once('exit', () => doHide());
					setTimeout(() => {
						doHide();
					}, 5000);
				}}
				style={{
					display: hideOpenDisk(parseState, deviceData, wpsAppId)
						? 'none'
						: 'inline-block'
				}}
				size="small"
				type="primary">
				打开WPS云盘
			</Button>
			<Button
				onClick={() => innerPhoneTableProp.editHandle(deviceData)}
				disabled={disableEditOrDel(parseState)}
				size="small"
				type="primary">
				编辑
			</Button>
			<Button
				onClick={() => {
					Modal.confirm({
						title: `删除「${deviceData.mobileName?.split('_')[0]}」数据`,
						content: `确认删除该取证数据吗？`,
						okText: '是',
						cancelText: '否',
						zIndex: 1031,
						async onOk() {
							// const deviceDb = getDb(TableName.Device);
							// const bcpHistoryDb = getDb(TableName.CreateBcpHistory);
							const modal = Modal.info({
								content: '正在删除，请不要关闭程序',
								okText: '确定',
								zIndex: 1031,
								maskClosable: false,
								okButtonProps: { disabled: true, icon: 'loading' }
							});
							try {
								setLoadingHandle(true);
								let success = await helper.delDiskFile(deviceData.phonePath!);
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
										ipcRenderer.invoke('db-remove', TableName.Device, {
											_id: deviceData._id
										}),
										ipcRenderer.invoke(
											'db-remove',
											TableName.CreateBcpHistory,
											{ deviceId: deviceData.id },
											true
										)
									]);
									let next: DeviceType[] = await ipcRenderer.invoke(
										'db-find',
										TableName.Device,
										{
											caseId: deviceData.caseId
										}
									);

									setDataHandle(
										next.sort((m, n) =>
											moment(m.fetchTime).isBefore(n.fetchTime) ? 1 : -1
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
				}}
				disabled={disableEditOrDel(parseState)}
				size="small"
				type="primary">
				删除
			</Button>
		</Group>
	);
};

export default connect((state: StateTree) => ({ traceLogin: state.traceLogin }))(Buttons);
