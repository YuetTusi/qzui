import React from 'react';
import { ipcRenderer, IpcRendererEvent } from 'electron';
import dva, { RouterAPI } from 'dva';
import { Dispatch } from 'redux';
import { createHashHistory as createHistory } from 'history';
import { RouterConfig } from './router/RouterConfig';
import dashboardModel from '@src/model/dashboard/index';
import initModel from '@src/model/dashboard/Init/Init';
import caseInputModal from '@src/model/dashboard/Init/CaseInputModal';
// import reduxLogger from 'redux-logger'; //若想查看仓库日志，打开此注释
import message from 'antd/lib/message';
import notification from 'antd/lib/notification';
import log from '@utils/log';
import './global.less';
import 'antd/dist/antd.less';

ipcRenderer.on('socket-disconnected', (event: IpcRendererEvent, args: string) => {
    log.error({ message: `RPC Socket已断开 @src/index.tsx: ${args}` });
    notification.destroy();
    notification.error({ message: '服务通讯已断开，请重启应用' });
});

let app = dva({
    history: createHistory()
});

//注册Model
app.model(dashboardModel);
app.model(initModel);
app.model(caseInputModal);

//注册路由
app.router((config?: RouterAPI) => {
    let { history, app } = config!;
    return <RouterConfig history={history} app={app} />
});

app.use({
    // onAction: reduxLogger, //若想查看仓库日志，打开此注释
    onError(error: Error, dispatch: Dispatch<any>) {
        message.destroy();
        message.error(error.message);
        log.error({ message: `全局异常 @src/index.tsx ${error.stack}` });
        console.log(`全局异常 @src/index.tsx:${error.stack}`);
        // dispatch({ type: 'init/clearPhoneData' })
    }
});

app.start('#root');