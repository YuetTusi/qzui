

declare global {
    interface Window {
        require: any;
        electron: any;
    }
}

/**
 * @description 一般对象
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
 * @description 组件
 */
interface IComponent {
    dispatch: IDispatchFunc;
    history: IObject;
    location: IObject;
    match: IObject;
}

/**
 * @description dva模型
 */
interface IModel {
    namespace: string,
    state: any;
    reducers?: IObject;
    effects?: IObject;
    subscriptions?: IObject;
}


export { IComponent, IObject, IAction, IModel };