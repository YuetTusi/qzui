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

export { StoreComponent, IObject, TypeObject, NVObject };