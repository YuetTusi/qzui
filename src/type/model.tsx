
import {
    put, apply, call, select, fork, cancel, take,
    race, all, spawn, cps, join, takeEvery, takeLatest
} from 'redux-saga/effects';
declare global {
    interface Window {
        require: (path: string) => any;
        __dirname: string;
        __filename: string;
        module: any;
        electron: any; //Electron对象
    }
}

/**
 * @description 纯对象
 */
interface IObject {
    [prop: string]: any;
}

/**
 * @description Action动作
 */
interface IAction {
    /**
     * @description ActionType
     */
    type: string;
    /**
     * @description 动作参数
     */
    payload?: any;
}

/**
 * @description 派发方法
 */
interface IDispatchFunc {
    (action: IAction): void;
}


/**
 * @description 通过dva注入的组件类型
 */
interface IComponent {
    /**
     * @description 派发方法
     */
    dispatch: IDispatchFunc;
    /**
     * @description RouterHistory对象
     */
    history: IObject;
    /**
     * @description RouterLocation对象
     */
    location: IObject;
    /**
     * @description RouterMatch对象，params获取路由参数
     */
    match: IObject;
}

/**
 * @description dva模型
 */
interface IModel {
    /**
     * @description 名字空间
     */
    namespace: string,
    /**
     * @description 状态
     */
    state: any;
    /**
     * @description Reducer方法
     */
    reducers?: IObject;
    /**
     * @description 副作用
     */
    effects?: IObject;
    /**
     * @description 订阅
     */
    subscriptions?: IObject;
}

/**
 * @description Saga副作用
 */
interface IEffects {
    /**
     * @description 发起ActionEffect
     */
    put: typeof put;
    /**
     * @description 调用函数
     */
    call: typeof call;
    /**
     * @description 调用函数
     */
    apply: typeof apply;
    /**
     * @description 获取当前时刻的state
     */
    select: typeof select;
    /**
     * @description 非阻塞调用函数
     */
    fork: typeof fork;
    /**
     * @description 取消分叉任务
     */
    cancel: typeof cancel;
    /**
     * @description 监听Action
     */
    take: typeof take;
    /**
     * @description 获取最先结果的Effect
     */
    race: typeof race;
    /**
     * @description 并发获取Effect
     */
    all: typeof all;
    /**
     * @description 创建非阻塞被分离的任务
     */
    spawn: typeof spawn;
    /**
     * @description 以Node风格调用函数
     */
    cps: typeof cps;
    /**
     * @description 等待之前的一个分叉任务的结果
     */
    join: typeof join;
    /**
     * @description 监听每一个指定的Action，发起任务
     */
    takeEvery: typeof takeEvery;
    /**
     * @description 监听Action取消之前的任务，发起新任务
     */
    takeLatest: typeof takeLatest;
}

export { IComponent, IObject, IAction, IModel, IDispatchFunc, IEffects };