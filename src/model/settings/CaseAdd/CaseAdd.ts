import IModel, { IAction, IEffects } from "@src/type/model";
import Rpc from "@src/service/rpc";
import { message } from "antd";

const rpc = new Rpc();

let model: IModel = {
    namespace: "caseAdd",
    state: {},
    reducers: {},
    effects: {
        *saveCase(action: IAction, { call, put }: IEffects) {
            try {
                yield call([rpc, 'invoke'], '', [action.payload]);
                message.success('保存成功');
            } catch (error) {
                console.error(`@modal/CaseAdd.ts/saveCase: ${error.message}`);
                message.error('保存失败');
            } finally {

            }
        }
    }
};

export default model;