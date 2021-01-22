import { Dispatch } from 'redux';
import { RouteComponentProps } from 'dva/router';
import Electron from 'electron';

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
 * @description 纯对象
 */
interface IObject {
	[prop: string]: any;
}

/**
 * 任意类型对象
 */
interface TypeObject<T> {
	[prop: string]: T;
}

/**
 * name-value对象
 */
interface NVObject {
	/**
	 * 键名
	 */
	name: string;
	/**
	 * 值
	 */
	value: string;
}

/**
 * 经DvaConnect注入的组件
 */
interface StoreComponent<MatchParam = any> extends RouteComponentProps<MatchParam> {
	dispatch: Dispatch<any>;
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
	useMode: number;
	/**
	 * 是否启用云取证
	 */
	useServerCloud: boolean;
}

export { StoreComponent, IObject, TypeObject, NVObject, DbInstance, Conf };
