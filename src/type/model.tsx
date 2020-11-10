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
 * 数据库对象的基类
 */
class BaseEntity {
	/**
	 * NeDB生成的id值
	 */
	public _id?: string;
	/**
	 * 记录创建时间
	 */
	public createdAt?: Date;
	/**
	 * 记录更新时间
	 */
	public updatedAt?: Date;
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

export { StoreComponent, IObject, TypeObject, NVObject, BaseEntity, DbInstance };
