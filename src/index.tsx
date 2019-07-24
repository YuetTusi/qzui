import React, { Component } from 'react';
import dva from 'dva';
import { createHashHistory as createHistory } from 'history';
// import { Router, Route, Switch } from 'dva/router';
// import { dynamicRoute } from './router/DynamicRoute';
import { RouterConfig } from './router/RouterConfig';
import defaultModel from '@src/model/default';


let app = dva({
    history: createHistory()
});

app.model(defaultModel);

app.router((config: any) => {
    let { history, app } = config;
    return <RouterConfig history={history} app={app} />
});

app.start('#root');