import React from 'react';
import dva from 'dva';
import { createHashHistory as createHistory } from 'history';
import { RouterConfig } from './router/RouterConfig';
import initModel from '@src/model/dashboard/Init/Init';
import caseInputModal from '@src/model/dashboard/Init/CaseInputModal';
// import reduxLogger from 'redux-logger'; //若想查看仓库日志，打开此注释
import message from 'antd/lib/message';
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
app.router((config: any) => {
    let { history, app } = config;
    return <RouterConfig history={history} app={app} />
});

app.use({
    // onAction: reduxLogger, //若想查看仓库日志，打开此注释
    onError(error, dispatch) {
        message.destroy();
        message.error(error.message);
        log.error({ message: `全局异常 @src/index.tsx ${error.stack}` });
        console.log(`全局异常 @src/index.tsx:${error.stack}`);
        // dispatch({ type: 'init/clearPhoneData' })
    }
});

app.start('#root');