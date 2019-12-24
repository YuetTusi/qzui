import { Model, EffectsCommandMap } from "dva";
import { AnyAction } from 'redux';
import Rpc from "@src/service/rpc";
import message from "antd/lib/message";
import { routerRedux } from "dva/router";

const rpc = new Rpc();

let model: Model = {
    namespace: "caseAdd",
    state: {},
    reducers: {},
    effects: {
        /**
         * 保存案件
         */
        *saveCase(action: AnyAction, { call, put }: EffectsCommandMap) {
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