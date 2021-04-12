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
import { StoreData as ImportDataModalStoreState } from '@src/model/tools/Menu/ImportDataModal';
import { CrackModalStore } from '@src/model/tools/Menu/CrackModal';
import { StoreData as OfficerStoreState } from '@src/model/settings/Officer/Officer';
import { StoreData as OfficerEditStoreState } from '@src/model/settings/OfficerEdit/OfficerEdit';
import { CheckManageModelState } from '@src/model/settings/CheckManage/CheckManage';
import { HumanVerifyStoreState } from '@src/model/components/Verify';

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
	importDataModal: ImportDataModalStoreState;
	crackModal: CrackModalStore;
	officer: OfficerStoreState;
	officerEdit: OfficerEditStoreState;
	checkManage: CheckManageModelState;
	humanVerify: HumanVerifyStoreState;
	[modelName: string]: any;
}

/**
 * NeDB数据库操作实例
 */
interface DbInstance<T = any> {
	/**
	 * 条件查询
	 * @param 条件
	 * @returns 返回文档集合
	 */
	find: (condition?: Record<string, any> | null) => Promise<T[]>;
	/**
	 * 条件查询，返回第一条记录
	 * @param condition 条件
	 * @returns 查询结果的第一条数据
	 */
	findOne: (condition?: Record<string, any> | null) => Promise<T>;
	/**
	 * 分页查询
	 * @param condition 条件
	 * @param pageIndex 当前页
	 * @param pageSize 分页尺寸
	 * @param asc 排序方向
	 * @returns 文档集合
	 */
	findByPage: (
		condition: Record<string, any> | null,
		pageIndex: number,
		pageSize: number,
		sortField?: string,
		asc?: 1 | -1
	) => Promise<T[]>;
	/**
	 * 查询文档全部记录
	 * @returns 文档集合
	 */
	all: () => Promise<T[]>;
	/**
	 * 查询当前条件记录数量
	 * @returns 数量
	 */
	count: (condition: Record<string, any> | null) => Promise<number>;
	/**
	 * 插入文档
	 * @param doc 文档
	 * @returns 插入的文档
	 */
	insert: (doc: T) => Promise<T>;
	/**
	 * 删除文档
	 * @param condition 条件
	 * @param multi 是否删除多条（默认为false）
	 */
	remove: (condition: Record<string, any> | null, multi?: boolean) => Promise<number>;
	/**
	 * 更新文档
	 * @param condition 条件
	 * @param newDoc 新文档
	 * @param multi 是否更新多条（默认为false）
	 * @returns 更新数量
	 */
	update: (condition: Record<string, any> | null, newDoc: T, multi?: boolean) => Promise<number>;
}

/**
 * ui.yaml配置
 */
interface Conf {
	/**
	 * 本地开发页面
	 */
	devPageUrl: string;
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
	 * 采集路数
	 */
	max: number;
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
	 * 使用模式 0:标准版本,1:部队版本(隐藏 BCP 相关模块)
	 */
	useMode: 0 | 1;
	/**
	 * 是否启用云取证
	 */
	useServerCloud: boolean;
}

export { StoreComponent, StateTree, DbInstance, Conf };
