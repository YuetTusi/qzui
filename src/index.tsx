import React from 'react';
import dva from 'dva';
import { createHashHistory as createHistory } from 'history';
import { RouterConfig } from './router/RouterConfig';
import initModel from '@src/model/dashboard/Init/Init';
import caseInputModal from '@src/model/dashboard/Init/CaseInputModal';
import collectionModel from '@src/model/collection';
// import reduxLogger from 'redux-logger';
import './global.less';
import 'antd/dist/antd.less';


//Dva实例
let app = dva({
    history: createHistory()
});

//同步注册Model
app.model(initModel);
app.model(caseInputModal);

//注册路由
app.router((config: any) => {
    let { history, app } = config;
    return <RouterConfig history={history} app={app} />
});

app.use({
    // onAction: reduxLogger,
    onError(error, dispatch) {
        console.log('全局异常 @src/index.tsx');
        console.log(error);
    }
});

app.start('#root');