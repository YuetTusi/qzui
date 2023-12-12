import { LoginStoreState } from '@src/model/login';
import { StoreComponent } from '@src/type/model';
import { FormComponentProps } from 'antd/lib/form';

export interface FormValue {
    /**
     * 用户名
     */
    userName: string,
    /**
     * 密码
     */
    password: string
}

export interface LoginProp extends StoreComponent, FormComponentProps<FormValue> {

    login: LoginStoreState
};