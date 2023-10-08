import React from 'react';
import { RouterAPI } from 'dva';
import { Router, Route } from 'dva/router';
import classnames from 'classnames';
import { helper } from '@utils/helper';
import { dynamicRoute } from './DynamicRoute';
import { registerModel } from './registerModel';
import Dashboard from '@src/view/dashboard/Index';
import aiSwitchModel from '@src/model/case/AISwitch';
import caseDataModel from '@src/model/case/CaseData';
import caseAddModel from '@src/model/case/CaseAdd';
import caseEditModel from '@src/model/case/CaseEdit';
import innerPhoneTableModel from '@src/model/record/Display/InnerPhoneTable';
import recordModel from '@src/model/record';
import bcpModel from '@src/model/record/Display/Bcp';
import batchExportReportModalModel from '@src/model/record/Display/BatchExportReportModal';
import trailModel from '@src/model/record/Display/Trail';
import exportBcpModalModel from '@src/model/record/Display/ExportBcpModal';
import toolsModel from '@src/model/tools';
import importDataModal from '@src/model/tools/Menu/ImportDataModal';
import crackModalModel from '@src/model/tools/Menu/CrackModal';
import apkModel from '@src/model/tools/ApkModal';
import fetchLogModel from '@src/model/operation/FetchLog/FetchLog';
import cloudLogModel from '@src/model/operation/CloudLog/CloudLog';
import parseLogModel from '@src/model/operation/ParseLog/ParseLog';
import settingsModel from '@src/model/settings';
import officerModel from '@src/model/settings/Officer/Officer';
import officerEditModal from '@src/model/settings/OfficerEdit/OfficerEdit';
import checkManageModel from '@src/model/settings/CheckManage/CheckManage';
import hitChartModalModel from '@src/model/components/HitChartModal';
import ErrorBoundary from '@src/components/ErrorBoundary/ErrorBoundary';

const { max } = helper.readConf();

/**
 * 动态路由配置
 */
const RouterConfig = ({ app, history }: RouterAPI) => (
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
						registerModel(app, aiSwitchModel); //注册model
						registerModel(app, caseDataModel);
						registerModel(app, caseAddModel);
						registerModel(app, caseEditModel);
						const Next = dynamicRoute(() => import('../view/case/Index'));
						return <Next />;
					}}
				/>
				<Route
					path="/record"
					render={() => {
						registerModel(app, innerPhoneTableModel);
						registerModel(app, recordModel);
						registerModel(app, bcpModel);
						registerModel(app, exportBcpModalModel);
						registerModel(app, batchExportReportModalModel);
						registerModel(app, hitChartModalModel);
						registerModel(app, trailModel);
						const Next = dynamicRoute(() => import('../view/record/Index'));
						return <Next />;
					}}
				/>
				<Route
					path="/tools"
					render={() => {
						registerModel(app, toolsModel);
						registerModel(app, importDataModal);
						registerModel(app, crackModalModel);
						registerModel(app, apkModel);
						const Next = dynamicRoute(() => import('../view/tools/Index'));
						return <Next />;
					}}
				/>
				<Route
					path="/operation"
					render={() => {
						registerModel(app, fetchLogModel);
						registerModel(app, cloudLogModel);
						registerModel(app, parseLogModel);
						const Next = dynamicRoute(() => import('../view/operation/Index'));
						return <Next />;
					}}
				/>
				<Route
					path="/settings"
					render={() => {
						registerModel(app, settingsModel);
						registerModel(app, officerModel);
						registerModel(app, officerEditModal);
						registerModel(app, checkManageModel);
						const Next = dynamicRoute(() => import('../view/settings/Index'));
						return <Next />;
					}}
				/>
			</div>
		</Router>
	</ErrorBoundary>
);

export { RouterConfig };
