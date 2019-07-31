

declare global {
    interface Window {
        require: any;
        electron: any; //Electron对象
        Rpc: any; //RPC请求类
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


export { IComponent, IObject, IAction, IModel, IDispatchFunc };