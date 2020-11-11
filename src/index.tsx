import React from 'react';
import { ipcRenderer, IpcRendererEvent, remote } from 'electron';
import { Dispatch } from 'redux';
import dva, { RouterAPI } from 'dva';
import useImmer from 'dva-immer';
import { createHashHistory as createHistory } from 'history';
import { RouterConfig } from './router/RouterConfig';
import dashboardModel from '@src/model/dashboard';
import caseInputModalModel from '@src/model/dashboard/Device/CaseInputModal';
import checkInputModalModel from '@src/model/dashboard/Device/CheckInputModal';
import deviceModel from '@src/model/dashboard/Device';
import parseModel from '@src/model/record/Display/Parse';
import progressModalModel from '@src/model/record/Display/ProgressModal';
// import reduxLogger from 'redux-logger'; //若想查看仓库日志，打开此注释
import message from 'antd/lib/message';
import notification from 'antd/lib/notification';
import log from '@utils/log';
import { helper } from '@utils/helper';
import server from '@src/service/tcpServer';
import { TableName } from './schema/db/TableName';
import CCaseInfo from './schema/CCaseInfo';
import DeviceType from './schema/socket/DeviceType';
import { ParseState } from './schema/socket/DeviceState';
import './styles/global.less';
import 'antd/dist/antd.less';
import { DbInstance } from './type/model';

const getDb = remote.getGlobal('getDb');
const { tcpPort } = helper.readConf();

server.listen(tcpPort, () => {
	console.log(`TCP服务已启动在端口${tcpPort}`);
});

let app = dva({
	history: createHistory()
});

//注册Model
app.model(dashboardModel);
app.model(deviceModel);
app.model(caseInputModalModel);
app.model(checkInputModalModel);
app.model(progressModalModel);
app.model(parseModel);

//注册路由
app.router((config?: RouterAPI) => {
	let { history, app } = config!;
	return <RouterConfig history={history} app={app} />;
});

app.use(useImmer());
app.use({
	// onAction: reduxLogger, //若想查看仓库日志，打开此注释
	onError(error: Error, dispatch: Dispatch<any>) {
		message.destroy();
		message.error(error.message);
		log.error({ message: `全局异常 @src/index.tsx ${error.stack}` });
		console.log(`全局异常 @src/index.tsx:${error.message}`);
	}
});

ipcRenderer.on('show-notification', (event: IpcRendererEvent, info: any) => {
	//显示notification消息
	let { message, description, type = 'info' } = info;
	switch (type) {
		case 'info':
			notification.info({
				message,
				description
			});
			break;
		case 'error':
			notification.error({
				message,
				description
			});
			break;
		case 'success':
			notification.success({
				message,
				description
			});
			break;
		default:
			notification.info({
				message,
				description
			});
			break;
	}
});

/**
 * 查询全部案件及设备数据
 * @description 此查询用于Http接口暴露给外部程序访问
 */
ipcRenderer.on('query-case', async (event: IpcRendererEvent) => {
	const caseDb: DbInstance<CCaseInfo> = getDb(TableName.Case);
	const deviceDb: DbInstance<DeviceType> = getDb(TableName.Device);
	let [caseList, deviceList]: [CCaseInfo[], DeviceType[]] = await Promise.all([
		caseDb.find({}),
		deviceDb.find({
			$or: [{ parseState: ParseState.Finished }, { parseState: ParseState.Error }]
		})
	]);

	let nextDevices = deviceList.map((device) => ({
		id: device.id,
		caseId: device.caseId,
		mobileName: device.mobileName,
		phonePath: device.phonePath,
		mobileHolder: device.mobileHolder
	}));

	let nextCases = caseList
		.reduce((acc: any[], current: CCaseInfo) => {
			acc.push({
				...current,
				devices: nextDevices.filter((i) => i.caseId === current._id)
			});
			return acc;
		}, [])
		.map((i) => ({
			id: i._id,
			m_strCaseName: i.m_strCaseName,
			m_strCasePath: i.m_strCasePath,
			devices: i.devices
		}));

	ipcRenderer.send('query-case-result', nextCases);
});

app.start('#root');
