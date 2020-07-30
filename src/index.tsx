import path from 'path';
import React from 'react';
import { remote, ipcRenderer, IpcRendererEvent } from 'electron';
import { Dispatch } from 'redux';
import dva, { RouterAPI } from 'dva';
import useImmer from 'dva-immer';
import { createHashHistory as createHistory } from 'history';
import { RouterConfig } from './router/RouterConfig';
import dashboardModel from '@src/model/dashboard';
import caseInputModalModel from '@src/model/dashboard/Device/CaseInputModal';
import deviceModel from '@src/model/dashboard/Device';
import progressModalModel from '@src/model/record/Display/ProgressModal';
// import reduxLogger from 'redux-logger'; //若想查看仓库日志，打开此注释
import message from 'antd/lib/message';
import notification from 'antd/lib/notification';
import log from '@utils/log';
import { helper } from '@utils/helper';
import server from '@src/service/tcpServer';
import './styles/global.less';
import 'antd/dist/antd.less';

const { tcpPort } = helper.readConf();

server.listen(tcpPort, () => {
    console.log(`TCP服务已启动在端口${tcpPort}`);
    log.info(`TCP服务已启动在端口${tcpPort}`);
});

let app = dva({
    history: createHistory()
});

//注册Model
app.model(dashboardModel);
app.model(deviceModel);
app.model(caseInputModalModel);
app.model(progressModalModel);

//注册路由
app.router((config?: RouterAPI) => {
    let { history, app } = config!;
    return <RouterConfig history={history} app={app} />
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

ipcRenderer.on('receive-version', (event: IpcRendererEvent, args: string) => {
    localStorage.setItem('VERSION', args); //当前版本号写入存储
});

ipcRenderer.on('window-resize', (event: IpcRendererEvent, windowWidth: number, windowHeight: number) => {
    sessionStorage.setItem('WindowWidth', windowWidth.toString());
    sessionStorage.setItem('WindowHeight', windowHeight.toString());
});

if (process.env.NODE_ENV !== 'development') {
    let publishPath = remote.app.getAppPath();
    //更新程序路径
    let updatePath = path.join(publishPath, '../../../update/update.exe');
    helper.runExe(updatePath).catch((errorMsg: string) => {
        log.error(`启动升级程序失败 程序位置： ${updatePath} 错误消息：${errorMsg}`);
    });
}
app.start('#root');