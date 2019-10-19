import React from 'react';
import dva from 'dva';
import { createHashHistory as createHistory } from 'history';
import { RouterConfig } from './router/RouterConfig';
import initModel from '@src/model/dashboard/Init/Init';
import caseInputModal from '@src/model/dashboard/Init/CaseInputModal';
// import reduxLogger from 'redux-logger';
import { message } from 'antd';
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
    // onAction: reduxLogger, //若想查看Redux日志，打开此注释
    onError(error, dispatch) {
        message.destroy();
        message.error(error.message);
        console.log(`全局异常 @src/index.tsx:${error.message}`);
    }
});

app.start('#root');