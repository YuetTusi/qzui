import React, { Fragment } from 'react';
import { RouterAPI } from 'dva';
import { Router, Route } from 'dva/router';
import { dynamicRoute } from './DynamicRoute';
import { registerModel } from './registerModel';
import Dashboard from '@src/view/dashboard/Index';
import caseDataModel from '@src/model/case/CaseData/CaseData';
import caseAddModel from '@src/model/case/CaseAdd/CaseAdd';
import caseEditModel from '@src/model/case/CaseEdit/CaseEdit';
import innerPhoneTableModel from '@src/model/case/CaseData/InnerPhoneTable';
import recordModel from '@src/model/record';
import displayModel from '@src/model/record/Display/Display';
import bcpModalModel from '@src/model/record/Display/BcpModal';
import toolsModel from '@src/model/tools';
import importDataModal from '@src/model/tools/Menu/ImportDataModal';
import settingsModel from '@src/model/settings';
import fetchLogModel from '@src/model/operation/FetchLog/FetchLog';
import fetchLogEditModel from '@src/model/operation/FetchLogEdit/FetchLogEdit';
import modifyLogModalModel from '@src/model/operation/FetchLogEdit/ModifyLogModal';
import parseLogModel from '@src/model/operation/ParseLog/ParseLog';
import unitModel from '@src/model/settings/Unit/Unit';
import dstUnitModel from '@src/model/settings/DstUnit/DstUnit';
import officerModel from '@src/model/settings/Officer/Officer';
import officerEditModal from '@src/model/settings/OfficerEdit/OfficerEdit';
import casePathModel from '@src/model/settings/CasePath/CasePath';

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
                    registerModel(app, innerPhoneTableModel);
                    registerModel(app, caseAddModel);
                    registerModel(app, caseEditModel);
                    const Dynamic = dynamicRoute(() => import('../view/case/Index'))
                    return <Dynamic />
                }}
            />
            <Route
                path="/record"
                render={() => {
                    registerModel(app, recordModel); //注册model
                    registerModel(app, displayModel);
                    registerModel(app, bcpModalModel);
                    const Dynamic = dynamicRoute(() => import('../view/record/Index'))
                    return <Dynamic />
                }}
            />
            <Route
                path="/tools"
                render={() => {
                    registerModel(app, toolsModel); //注册model
                    registerModel(app, importDataModal);
                    const Dynamic = dynamicRoute(() => import('../view/tools/Index'))
                    return <Dynamic />
                }}
            />
            <Route
                path="/operation"
                render={() => {
                    registerModel(app, fetchLogModel);
                    registerModel(app, fetchLogEditModel);
                    registerModel(app, modifyLogModalModel);
                    registerModel(app, parseLogModel);
                    const Dynamic = dynamicRoute(() => import('../view/operation/Index'))
                    return <Dynamic />
                }}
            />
            <Route
                path="/settings"
                render={() => {
                    registerModel(app, settingsModel); //注册model
                    registerModel(app, unitModel);
                    registerModel(app, dstUnitModel);
                    registerModel(app, officerModel);
                    registerModel(app, officerEditModal);
                    registerModel(app, casePathModel);
                    const Dynamic = dynamicRoute(() => import('../view/settings/Index'))
                    return <Dynamic />
                }}
            />
        </Fragment>
    </Router>
}

export { RouterConfig };