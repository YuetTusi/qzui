import Electron from 'electron';
import { Dispatch } from 'redux';
import { RouteComponentProps } from 'dva/router';
import { StoreState as CaseAddStoreState } from '@src/model/case/CaseAdd/CaseAdd';
import { StoreModel as CaseDataStoreState } from '@src/model/case/CaseData/CaseData';
import { StoreState as CaseEditStoreState } from '@src/model/case/CaseEdit/CaseEdit';
import { CloudCodeModalStoreState } from '@src/model/components/CloudCodeModal';
import { DashboardStore } from '@src/model/dashboard';
import { StoreState as DeviceStoreState } from '@src/model/dashboard/Device';
import { StoreState as CaseInputModalStoreState } from '@src/model/dashboard/Device/CaseInputModal';
import { StoreState as CheckInputModalStoreState } from '@src/model/dashboard/Device/CheckInputModal';
import { StoreState as ServerCloudInputModalStoreState } from '@src/model/dashboard/Device/ServerCloudInputModal';
import { CloudLogStoreState } from '@src/model/operation/CloudLog/CloudLog';
import { StoreData as FetchLogStoreState } from '@src/model/operation/FetchLog/FetchLog';
import { StoreData as ParseLogStoreState } from '@src/model/operation/ParseLog/ParseLog';
import { StoreModel as ParseStoreState } from '@src/model/record/Display/Parse';
import { BcpModelState } from '@src/model/record/Display/Bcp';
import { ProgressModalState } from '@src/model/record/Display/ProgressModal';
import { ExportBcpModalStore } from '@src/model/record/Display/ExportBcpModal';
import { BatchExportReportModalState } from '@src/model/record/Display/BatchExportReportModal';
import { StoreData as ImportDataModalStoreState } from '@src/model/tools/Menu/ImportDataModal';
import { CrackModalStore } from '@src/model/tools/Menu/CrackModal';
import { StoreData as OfficerStoreState } from '@src/model/settings/Officer/Officer';
import { StoreData as OfficerEditStoreState } from '@src/model/settings/OfficerEdit/OfficerEdit';
import { CheckManageModelState } from '@src/model/settings/CheckManage/CheckManage';

declare global {
	interface Window {
		require: (path: string) => any;
		__dirname: string;
		__filename: string;
		module: NodeModule;
		electron: typeof Electron; //Electron对象
	}
}

/**
 * 经DvaConnect注入的组件
 */
interface StoreComponent<MatchParam = any> extends RouteComponentProps<MatchParam> {
	/**
	 * Dispatcher方法
	 */
	dispatch: Dispatch<any>;
}

/**
 * Redux状态树
 */
interface StateTree {
	caseAdd: CaseAddStoreState;
	caseData: CaseDataStoreState;
	caseEdit: CaseEditStoreState;
	cloudCodeModal: CloudCodeModalStoreState;
	dashboard: DashboardStore;
	device: DeviceStoreState;
	caseInputModal: CaseInputModalStoreState;
	checkInputModal: CheckInputModalStoreState;
	serverCloudInputModal: ServerCloudInputModalStoreState;
	cloudLog: CloudLogStoreState;
	fetchLog: FetchLogStoreState;
	parseLog: ParseLogStoreState;
	parse: ParseStoreState;
	bcp: BcpModelState;
	progressModal: ProgressModalState;
	exportBcpModal: ExportBcpModalStore;
	batchExportReportModal: BatchExportReportModalState;
	importDataModal: ImportDataModalStoreState;
	crackModal: CrackModalStore;
	officer: OfficerStoreState;
	officerEdit: OfficerEditStoreState;
	checkManage: CheckManageModelState;
	[modelName: string]: any;
}

/**
 * ui.yaml配置
 */
interface Conf {
	/**
	 * 采集路数
	 */
	max: number;
	/**
	 * 是否启用标准取证
	 */
	useFetch: boolean;
	/**
	 * 是否启用云取证
	 */
	useServerCloud: boolean;
	/**
	 * 是否启用BCP
	 */
	useBcp: boolean;
	/**
	 * 是否启用工具箱
	 */
	useToolBox: boolean;
	/**
	 * 是否显示工具箱假按钮
	 */
	useFakeButton: boolean;
	/**
	 * 是否启用AI分析
	 */
	useAi: boolean;
	/**
	 * 云取应用HTTP接口地址
	 */
	cloudAppUrl: string;
	/**
	 * 云取应用MD5验证接口地址
	 */
	cloudAppMd5: string;
	/**
	 * 是否启用硬件加速
	 */
	useHardwareAcceleration: boolean;
	/**
	 * 应用LOGO文件名
	 */
	logo: string;
	/**
	 * 窗口高度
	 */
	windowHeight: number;
	/**
	 * 窗口宽度
	 */
	windowWidth: number;
	/**
	 * 是否居中显示
	 */
	center: boolean;
	/**
	 * TCP端口
	 */
	tcpPort: number;
	/**
	 * HTTP端口
	 */
	httpPort: number;
	/**
	 * 采集程序路径
	 */
	fetchPath: string;
	/**
	 * 采集程序名称
	 */
	fetchExe: string;
	/**
	 * 解析程序路径
	 */
	parsePath: string;
	/**
	 * 解析程序名称
	 */
	parseExe: string;
	/**
	 * 发布路径
	 */
	publishPage: string;
	/**
	 * 日志路径
	 */
	logFile: string;
	/**
	 * 本地开发页面
	 */
	devPageUrl: string;
}

export { StoreComponent, StateTree, Conf };
