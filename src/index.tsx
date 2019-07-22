import React, { Component } from 'react';
import dva from 'dva';
import { createHashHistory as createHistory } from 'history';
import { Router, Route, Switch } from 'dva/router';
import defaultModel from '@src/model/default';
import Default from './view/Default';
import Profile from './view/Profile';

let app = dva({
    history: createHistory()
});

app.model(defaultModel);

app.router((config: any) => {
    return <Router history={config.history}>
        <Switch>
            <Route path="/" exact={true} component={Default}></Route>
            <Route path="/profile" component={Profile}></Route>
        </Switch>

    </Router>
});

app.start('#root');