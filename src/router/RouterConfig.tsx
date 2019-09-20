import React, { Fragment } from 'react';
import { Router, Route } from 'dva/router';
import { dynamicRoute } from './DynamicRoute';
import { registerModel } from './registerModel';
import Dashboard from '@src/view/dashboard/Index';
// import Collection from '@src/view/collection/Collection';
import recordModel from '@src/model/record';
import toolsModel from '@src/model/tools';
import settingsModel from '@src/model/settings';
import caseModel from '@src/model/settings/Case/Case';
import unitModal from '@src/model/settings/Unit/Unit';
import officerModal from '@src/model/settings/Officer/Officer';

/**
 * @description 动态路由配置
 * @param config dva配置对象
 */
function RouterConfig(props: any) {
    let { history, app } = props;

    return <Router history={history}>
        <Fragment>
            <Route
                path="/"
                exact={true}
                component={Dashboard}
            />
            <Route
                path="/dashboard"
                component={Dashboard}
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
                    registerModel(app, caseModel);
                    registerModel(app, unitModal);
                    registerModel(app, officerModal);
                    const Dynamic = dynamicRoute(() => import('../view/settings/Index'))
                    return <Dynamic />
                }}
            />
        </Fragment>
    </Router>
}

export { RouterConfig };