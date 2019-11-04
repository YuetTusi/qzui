import IModel, { IAction, IEffects, IObject } from '@type/model';
import Rpc from "@src/service/rpc";
import { message } from "antd";

const rpc = new Rpc();


/**
 * 数据详情Model
 * 对应视图: view/record/Parsing
 */
let model: IModel = {
    namespace: 'parsing',
    state: {
    },
    reducers: {
    },
    effects: {
    }
};

export default model;