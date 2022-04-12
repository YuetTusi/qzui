import fs from 'fs';
import path from 'path';
import React from 'react';
import { ipcRenderer, IpcRendererEvent } from 'electron';
import dva, { RouterAPI } from 'dva';
// import reduxLogger from 'redux-logger'; //若想查看仓库日志，打开此注释
import useImmer from 'dva-immer';
import { createHashHistory as createHistory } from 'history';
import yaml from 'js-yaml';
import { RouterConfig } from './router/RouterConfig';
import dashboardModel from '@src/model/dashboard';
import caseInputModalModel from '@src/model/dashboard/Device/CaseInputModal';
import checkInputModalModel from '@src/model/dashboard/Device/CheckInputModal';
import serverCloudInputModalModel from '@src/model/dashboard/Device/ServerCloudInputModal';
import cloudCodeModalModel from '@src/model/components/CloudCodeModal';
import deviceModel from '@src/model/dashboard/Device';
import parseModel from '@src/model/record/Display/Parse';
import menuModel from '@src/model/tools/Menu/Menu';
import progressModalModel from '@src/model/record/Display/ProgressModal';
import traceLoginModel from '@src/model/settings/TraceLogin';
import messageBox from 'antd/lib/message';
import notification from 'antd/lib/notification';
import log from '@utils/log';
import { helper } from '@utils/helper';
import server from '@src/service/tcpServer';
import { TableName } from './schema/db/TableName';
import CCaseInfo, { CaseType } from './schema/CCaseInfo';
import DeviceType from './schema/socket/DeviceType';
import { ParseState } from './schema/socket/DeviceState';
import '@ztree/ztree_v3/js/jquery.ztree.all.min';
import '@ztree/ztree_v3/css/zTreeStyle/zTreeStyle.css';
import '@src/styles/ztree-overwrite.less';
import './styles/global.less';
import 'antd/dist/antd.less';

const appPath = process.cwd();
const { tcpPort } = helper.readConf();
const app = dva({
	history: createHistory()
});

(async () => {
	let port = tcpPort;
	try {
		port = await helper.portStat(tcpPort);
		await ipcRenderer.invoke('write-net-json', port);
	} catch (error) {
		log.error(`检测端口占用失败 @index.tsx:${error.message}`);
		port = tcpPort;
	} finally {
		server.listen(port, () => {
			console.log(`TCP服务已启动在端口${port}`);
			ipcRenderer.send('run-service');
		});
	}
})();

//注册Model
app.model(dashboardModel);
app.model(deviceModel);
app.model(caseInputModalModel);
app.model(checkInputModalModel);
app.model(serverCloudInputModalModel);
app.model(cloudCodeModalModel);
app.model(progressModalModel);
app.model(parseModel);
app.model(menuModel);
app.model(traceLoginModel);

//注册Router
app.router((config?: RouterAPI) => <RouterConfig history={config!.history} app={config!.app} />);
//注册Plugin
app.use(useImmer());
app.use({
	// onAction: reduxLogger, //若想查看仓库日志，打开此注释
	onError({ message, stack }: Error) {
		messageBox.destroy();
		messageBox.error(message);
		log.error({ message: `全局异常 @src/index.tsx ${stack}` });
		console.log(`全局异常 @src/index.tsx:${message}`);
	}
});

//测试代码，以后会删除
ipcRenderer.on('hardware-acceleration', (event: IpcRendererEvent, useHardwareAcceleration) => {
	sessionStorage.setItem('useHardwareAcceleration', useHardwareAcceleration);
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
ipcRenderer.on('query-case', async () => {
	try {
		let [caseList, deviceList]: [CCaseInfo[], DeviceType[]] = await Promise.all([
			ipcRenderer.invoke('db-find', TableName.Case, {}),
			ipcRenderer.invoke('db-find', TableName.Device, {
				$or: [{ parseState: ParseState.Finished }, { parseState: ParseState.Error }]
			})
		]);

		let nextDevices = deviceList.map((device) => ({
			id: device.id,
			caseId: device.caseId,
			mobileName: device.mobileName,
			phonePath: device.phonePath,
			mobileHolder: device.mobileHolder,
			mobileNo: device.mobileNo ?? '',
			mode: device.mode ?? 0
		}));

		let nextCases = caseList
			.reduce((acc: any[], current: CCaseInfo) => {
				return acc.concat([
					{
						...current,
						devices: nextDevices.filter((i) => i.caseId === current._id)
					}
				]);
			}, [])
			.map(({ _id, m_strCaseName, m_strCasePath, devices }) => ({
				id: _id,
				m_strCaseName,
				m_strCasePath,
				devices
			}));

		ipcRenderer.send('query-case-result', nextCases);
	} catch (error) {
		log.error(`HTTP接口查询案件失败 @src/index.tsx: ${error.message}`);
		ipcRenderer.send('query-case-result', []);
	}
});

/**
 * 查询快速点验案件（CaseType===1）
 * 按案件id查询
 */
ipcRenderer.on('query-wifi-case', async (event: IpcRendererEvent, id: string) => {
	try {
		const next: CCaseInfo[] = await ipcRenderer.invoke('db-find', TableName.Case, { caseType: CaseType.QuickCheck });
		ipcRenderer.send('query-wifi-case-result', next);
	} catch (error) {
		log.error(`HTTP接口查询案件失败 @src/index.tsx: ${error.message}`);
		ipcRenderer.send('query-wifi-case-result', []);
	}
});


ipcRenderer.on('read-app-yaml', (event: IpcRendererEvent, type: string) => {
	let apps: string | object | undefined = {};
	if (type) {
		try {
			apps = yaml.safeLoad(
				fs.readFileSync(path.join(appPath, `src/config/${type}.yaml`), 'utf8')
			);
		} catch (error) {
			log.error(`HTTP接口查询AppYaml失败 @src/index.tsx: ${error.message}`);
		} finally {
			ipcRenderer.send('read-app-yaml-result', apps);
		}
	} else {
		ipcRenderer.send('read-app-yaml-result', { error: '未提供参数' });
	}
});

app.start('#root');
