import IModel, { IAction, IEffects, IObject } from '@type/model';
import Rpc from "@src/service/rpc";
import { message } from "antd";

const rpc = new Rpc();


/**
 * 手机列表Model
 * 对应视图: view/record/PhoneList
 */
let model: IModel = {
    namespace: 'phoneList',
    state: {
        phoneListData: []
    },
    reducers: {
        setPhoneListData(state: IObject, { payload }: IAction) {
            return {
                ...state,
                phoneListData: [...payload]
            }
        }
    },
    effects: {
    }
};

export default model;