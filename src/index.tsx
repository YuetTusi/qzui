import { ipcRenderer, IpcRendererEvent } from 'electron';
import React from 'react';
import dva, { RouterAPI } from 'dva';
import { Dispatch } from 'redux';
import { createHashHistory as createHistory } from 'history';
import { RouterConfig } from './router/RouterConfig';
import initModel from '@src/model/dashboard/Init/Init';
import caseInputModal from '@src/model/dashboard/Init/CaseInputModal';
// import reduxLogger from 'redux-logger'; //若想查看仓库日志，打开此注释
import message from 'antd/lib/message';
import Modal from 'antd/lib/modal';
// import { parsing } from '@src/service/rpc';
import log from '@utils/log';
import './global.less';
import 'antd/dist/antd.less';

let app = dva({
    history: createHistory()
});

//注册Model
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

ipcRenderer.on('will-close', (event: IpcRendererEvent, args: any) => {
    //用户退出前，要验证是否还有设备进行采集或解析
    // const [hasFetching,hasParsing]=await Promise.all([]);
    let question = '确认退出N次方多路取证塔？';
    Promise.all([
        Promise.resolve(false),
        Promise.resolve(false)
        // parsing.invoke('hasParsing', [])
    ]).then(([hasFetching, hasParsing]) => {
        console.log('hasParsing: ', hasParsing);
        console.log('hasFetching: ', hasFetching);

        if (hasFetching || hasParsing) {
            question = '有设备正在采集或解析中，仍要退出？';
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

app.start('#root');