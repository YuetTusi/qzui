import { ipcRenderer, IpcRendererEvent } from 'electron';
import React from 'react';
import dva, { RouterAPI } from 'dva';
import { Dispatch } from 'redux';
import { createHashHistory as createHistory } from 'history';
import { RouterConfig } from './router/RouterConfig';
import { fetcher, parser } from '@src/service/rpc';
import dashboardModel from '@src/model/dashboard';
import initModel from '@src/model/dashboard/Init/Init';
import caseInputModal from '@src/model/dashboard/Init/CaseInputModal';
// import reduxLogger from 'redux-logger'; //若想查看仓库日志，打开此注释
import message from 'antd/lib/message';
import notification from 'antd/lib/notification';
import Modal from 'antd/lib/modal';
import log from '@utils/log';
import './global.less';
import 'antd/dist/antd.less';

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

ipcRenderer.send('publish-path');

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
ipcRenderer.on('will-close', (event: IpcRendererEvent, args: any) => {
    //用户退出前，要验证是否还有设备进行采集或解析
    let question = '确认退出N次方多路取证塔？';
    Promise.all([
        // Promise.resolve(false),
        // Promise.resolve(false)
        fetcher.invoke<boolean>('IsInFetchingState', []),
        parser.invoke<boolean>('hasParsing', [])
    ]).then(([isFetching, isParsing]) => {
        if (isFetching && isParsing) {
            question = '有设备正在取证和解析，仍要退出？';
        } else if (isFetching && !isParsing) {
            question = '有设备正在取证，仍要退出？'
        } else if (!isFetching && isParsing) {
            question = '有设备正在解析，仍要退出？'
        } else {
            question = '确认退出N次方多路取证塔？'
        }
        Modal.destroyAll();
        Modal.confirm({
            title: '退出',
            content: question,
            okText: '是',
            cancelText: '否',
            onOk() {
                ipcRenderer.send('do-close', true);
            }
        });
    }).catch((error) => {
        console.log(error);
        Modal.destroyAll();
        Modal.confirm({
            title: '退出',
            content: question,
            okText: '是',
            cancelText: '否',
            onOk() {
                ipcRenderer.send('do-close', true);
            }
        });
    });
});
ipcRenderer.on('receive-publish-path', (event: IpcRendererEvent, args: string) => {
    localStorage.setItem('PUBLISH_PATH', args);
})

app.start('#root');