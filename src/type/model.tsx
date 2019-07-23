interface IObject {
    [prop: string]: any;
}

interface IAction {
    type: string;
    payload: any;
}

interface IComponent {
    dispatch: any;
}

interface IModel {
    namespace: string,
    state: any;
    reducers?: IObject;
    effects?: IObject;
    subscriptions?: IObject;
}


export { IComponent, IObject, IAction, IModel };