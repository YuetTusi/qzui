

declare global {
    interface Window {
        require: any;
        electron: any;
        Rpc: any;
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
    type: string;
    payload?: any;
}

/**
 * @description dispatch方法
 */
interface IDispatchFunc {
    (action: IAction): void;
}


/**
 * @description 通过dva注入的组件类型
 */
interface IComponent {
    //派发方法
    dispatch: IDispatchFunc;
    //路由内置对象
    history: IObject;
    location: IObject;
    match: IObject;
}

/**
 * @description dva模型
 */
interface IModel {
    //名字空间
    namespace: string,
    //状态对象
    state: any;
    //Reducer
    reducers?: IObject;
    //副作用
    effects?: IObject;
    //订阅
    subscriptions?: IObject;
}


export { IComponent, IObject, IAction, IModel };