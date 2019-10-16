import IModel, { IAction, IEffects } from "@src/type/model";
import Rpc from "@src/service/rpc";
import { message } from "antd";
import { routerRedux } from "dva/router";

const rpc = new Rpc();

let model: IModel = {
    namespace: "caseAdd",
    state: {},
    reducers: {},
    effects: {
        /**
         * 保存案件
         */
        *saveCase(action: IAction, { call, put }: IEffects) {
            try {
                yield call([rpc, 'invoke'], 'SaveCaseInfo', [action.payload]);
                yield put(routerRedux.push('/settings/case'));
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