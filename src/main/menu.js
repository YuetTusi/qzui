const { loadAppJson, writeAppJson } = require('./utils');

const mode = process.env['NODE_ENV'];

/**
 * 右键菜单配置
 * webContents 主窗口WebContent
 */
const getConfigMenuConf = (webContents) => {
	let disableSocketDisconnectWarn = false;
	try {
		disableSocketDisconnectWarn = loadAppJson(mode)?.disableSocketDisconnectWarn ?? false;
	} catch (error) {
		disableSocketDisconnectWarn = false;
	}

	return [
		{
			label: '设备取证',
			click: () => webContents.send('go-to-url', '/?role=admin')
		},
		{
			label: '案件管理',
			click: () => webContents.send('go-to-url', '/case?role=admin')
		},
		{
			label: '采集日志管理',
			click: () => webContents.send('go-to-url', '/operation?role=admin')
		},
		{
			label: '云取日志管理',
			click: () => webContents.send('go-to-url', '/operation/cloud-log?role=admin')
		},
		{
			label: '解析日志管理',
			click: () => webContents.send('go-to-url', '/operation/parse-log?role=admin')
		},
		{ type: 'separator' },
		{
			label: '软硬件信息配置',
			click: () => webContents.send('go-to-url', '/settings/bcp-conf')
		},
		{ type: 'separator' },
		{
			label: '表单历史记录清除',
			click: () => webContents.send('go-to-url', '/settings/input-history')
		},
		{
			label: '单位设置清除',
			click: () => webContents.send('go-to-url', '/settings/clear-unit')
		},
		{ type: 'separator' },
		{
			label: '显示DevTools',
			click: () => webContents.openDevTools()
		},
		{
			label: `禁用断线警告${disableSocketDisconnectWarn ? ' ●' : ''}`,
			click: () => {
				writeAppJson(mode, { disableSocketDisconnectWarn: !disableSocketDisconnectWarn });
			}
		},
		{ label: '刷新窗口', click: () => webContents.reload() }
	];
};

module.exports = {
	getConfigMenuConf
};
