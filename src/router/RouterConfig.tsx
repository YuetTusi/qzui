import React from 'react';
import { Router, Switch, Route } from 'dva/router';
import { dynamicRoute } from './DynamicRoute';
import { registerModel } from './registerModel';
import Collection from '@src/view/collection/Index';
import recordModel from '@src/model/record';
import toolsModel from '@src/model/tools';
import settingsModel from '@src/model/settings';

/**
 * @description 动态路由配置
 * @param config dva配置对象
 */
function RouterConfig(props: any) {
    let { history, app } = props;

    return <Router history={history}>
        <Switch>
            <Route
                path="/"
                exact={true}
                component={Collection}
            />
            <Route
                path="/collection"
                component={Collection}
            />
            <Route
                path="/record"
                render={() => {
                    registerModel(app, recordModel); //注册model
                    const Dynamic = dynamicRoute(() => import('../view/record/Index'))
                    return <Dynamic />
                }}
            />
            <Route
                path="/tools"
                render={() => {
                    registerModel(app, toolsModel); //注册model
                    const Dynamic = dynamicRoute(() => import('../view/tools/Index'))
                    return <Dynamic />
                }}
            />
            <Route
                path="/settings"
                render={() => {
                    registerModel(app, settingsModel); //注册model
                    const Dynamic = dynamicRoute(() => import('../view/settings/Index'))
                    return <Dynamic />
                }}
            />
        </Switch>

    </Router>
}

export { RouterConfig };