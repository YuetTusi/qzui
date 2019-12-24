import { Dispatch } from 'redux';
import { RouteComponentProps } from 'dva/router';

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
 * 任意类型对象
 */
interface TypeObject<T> {
    [prop: string]: T;
}

interface StoreComponent<S = any> extends RouteComponentProps<any> {
    dispatch: Dispatch<S>;
}

export { StoreComponent, IObject, TypeObject };