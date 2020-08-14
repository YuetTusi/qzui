import React, { Fragment } from 'react';
import { RouterAPI } from 'dva';
import { Router, Route } from 'dva/router';
import { dynamicRoute } from './DynamicRoute';
import { registerModel } from './registerModel';
import Dashboard from '@src/view/dashboard/Index';
import caseDataModel from '@src/model/case/CaseData/CaseData';
import caseAddModel from '@src/model/case/CaseAdd/CaseAdd';
import caseEditModel from '@src/model/case/CaseEdit/CaseEdit';
import recordModel from '@src/model/record';
import bcpModel from '@src/model/record/Display/Bcp';
import toolsModel from '@src/model/tools';
import importDataModal from '@src/model/tools/Menu/ImportDataModal';
import menuModel from '@src/model/tools/Menu/Menu';
import fetchLogModel from '@src/model/operation/FetchLog/FetchLog';
import parseLogModel from '@src/model/operation/ParseLog/ParseLog';
import settingsModel from '@src/model/settings';
import officerModel from '@src/model/settings/Officer/Officer';
import officerEditModal from '@src/model/settings/OfficerEdit/OfficerEdit';
import ftpConfigModel from '@src/model/settings/FtpConfig/FtpConfig';
import crimeModel from '@src/model/settings/Word/Crime';

/**
 * @description 动态路由配置
 * @param props 路由&dva实例
 */
function RouterConfig(props: RouterAPI) {
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
                path="/case"
                render={() => {
                    registerModel(app, caseDataModel); //注册model
                    registerModel(app, caseAddModel);
                    registerModel(app, caseEditModel);
                    const Dynamic = dynamicRoute(() => import('../view/case/Index'))
                    return <Dynamic />
                }}
            />
            <Route
                path="/record"
                render={() => {
                    registerModel(app, recordModel);
                    registerModel(app, bcpModel);
                    const Dynamic = dynamicRoute(() => import('../view/record/Index'))
                    return <Dynamic />
                }}
            />
            <Route
                path="/tools"
                render={() => {
                    registerModel(app, toolsModel);
                    registerModel(app, importDataModal);
                    registerModel(app, menuModel);
                    const Dynamic = dynamicRoute(() => import('../view/tools/Index'))
                    return <Dynamic />
                }}
            />
            <Route
                path="/operation"
                render={() => {
                    registerModel(app, fetchLogModel);
                    registerModel(app, parseLogModel);
                    const Dynamic = dynamicRoute(() => import('../view/operation/Index'))
                    return <Dynamic />
                }}
            />
            <Route
                path="/settings"
                render={() => {
                    registerModel(app, settingsModel);
                    registerModel(app, officerModel);
                    registerModel(app, officerEditModal);
                    registerModel(app, ftpConfigModel);
                    registerModel(app, crimeModel);
                    const Dynamic = dynamicRoute(() => import('../view/settings/Index'))
                    return <Dynamic />
                }}
            />
        </Fragment>
    </Router>
}

export { RouterConfig };