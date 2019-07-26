import React from 'react';
import dva from 'dva';
import { createHashHistory as createHistory } from 'history';
import { RouterConfig } from './router/RouterConfig';
import defaultModel from '@src/model/default';
import 'antd/dist/antd.less';

let app = dva({
    history: createHistory()
});

app.model(defaultModel);

app.router((config: any) => {
    let { history, app } = config;
    return <RouterConfig history={history} app={app} />
});

app.start('#root');