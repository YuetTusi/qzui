import React from 'react';
import { RouterAPI } from 'dva';
import { Router, Route } from 'dva/router';
import classnames from 'classnames';
import { helper } from '@utils/helper';
import { dynamicRoute } from './DynamicRoute';
import { registerModel } from './registerModel';
import Dashboard from '@src/view/dashboard/Index';
import caseDataModel from '@src/model/case/CaseData/CaseData';
import caseAddModel from '@src/model/case/CaseAdd/CaseAdd';
import caseEditModel from '@src/model/case/CaseEdit/CaseEdit';
import innerPhoneTableModel from '@src/model/record/Display/InnerPhoneTable';
import recordModel from '@src/model/record';
import bcpModel from '@src/model/record/Display/Bcp';
import exportBcpModalModel from '@src/model/record/Display/ExportBcpModal';
import toolsModel from '@src/model/tools';
import importDataModal from '@src/model/tools/Menu/ImportDataModal';
import menuModel from '@src/model/tools/Menu/Menu';
import crackModalModel from '@src/model/tools/Menu/CrackModal';
import fetchLogModel from '@src/model/operation/FetchLog/FetchLog';
import cloudLogModel from '@src/model/operation/CloudLog/CloudLog';
import parseLogModel from '@src/model/operation/ParseLog/ParseLog';
import settingsModel from '@src/model/settings';
import officerModel from '@src/model/settings/Officer/Officer';
import officerEditModal from '@src/model/settings/OfficerEdit/OfficerEdit';
import checkManageModel from '@src/model/settings/CheckManage/CheckManage';
import ErrorBoundary from '@src/components/ErrorBoundary/ErrorBoundary';

const { max } = helper.readConf();

/**
 * @description 动态路由配置
 * @param props 路由&dva实例
 */
function RouterConfig(props: RouterAPI) {
	let { history, app } = props;
	return (
		<ErrorBoundary>
			<Router history={history}>
				<div
					className={classnames({
						'display-mode-computer': max > 2,
						'display-mode-pad': max <= 2
					})}>
					<Route path="/" exact={true} component={Dashboard} />
					<Route path="/dashboard" component={Dashboard} />
					<Route
						path="/case"
						render={() => {
							registerModel(app, caseDataModel); //注册model
							registerModel(app, caseAddModel);
							registerModel(app, caseEditModel);
							const Dynamic = dynamicRoute(() => import('../view/case/Index'));
							return <Dynamic />;
						}}
					/>
					<Route
						path="/record"
						render={() => {
							registerModel(app, innerPhoneTableModel);
							registerModel(app, recordModel);
							registerModel(app, bcpModel);
							registerModel(app, exportBcpModalModel);
							const Dynamic = dynamicRoute(() => import('../view/record/Index'));
							return <Dynamic />;
						}}
					/>
					<Route
						path="/tools"
						render={() => {
							registerModel(app, toolsModel);
							registerModel(app, importDataModal);
							registerModel(app, menuModel);
							registerModel(app, crackModalModel);
							const Dynamic = dynamicRoute(() => import('../view/tools/Index'));
							return <Dynamic />;
						}}
					/>
					<Route
						path="/operation"
						render={() => {
							registerModel(app, fetchLogModel);
							registerModel(app, cloudLogModel);
							registerModel(app, parseLogModel);
							const Dynamic = dynamicRoute(() => import('../view/operation/Index'));
							return <Dynamic />;
						}}
					/>
					<Route
						path="/settings"
						render={() => {
							registerModel(app, settingsModel);
							registerModel(app, officerModel);
							registerModel(app, officerEditModal);
							registerModel(app, checkManageModel);
							const Dynamic = dynamicRoute(() => import('../view/settings/Index'));
							return <Dynamic />;
						}}
					/>
				</div>
			</Router>
		</ErrorBoundary>
	);
}

export { RouterConfig };
