import IModel, { IAction, IEffects, IObject } from '@type/model';
import Rpc from "@src/service/rpc";
import { message } from "antd";

const rpc = new Rpc();


/**
 * 数据采集首页Model
 * 对应视图: view/record/Display
 */
let model: IModel = {
    namespace: 'display',
    state: {
        //案件表格数据
        caseData: [],
        loading: false
    },
    reducers: {
        setCaseData(state: IObject, action: IAction) {
            return {
                ...state,
                caseData: [...action.payload]
            }
        },
        setLoading(state: IObject, action: IAction) {
            return {
                ...state,
                loading: action.payload
            }
        }
    },
    effects: {
        /**
         * 查询案件列表
         */
        *fetchCaseData(action: IAction, { call, put }: IEffects) {
            yield put({ type: 'setLoading', payload: true });
            try {
                let casePath = yield call([rpc, 'invoke'], 'GetDataSavePath');
                let result = yield call([rpc, 'invoke'], 'GetCaseList', [casePath]);
                yield put({ type: 'setCaseData', payload: result });
            } catch (error) {
                console.log(`@modal/Case.ts/fetchCaseData: ${error.message}`);
                message.error('查询案件数据失败');
            } finally {
                yield put({ type: 'setLoading', payload: false });
            }
        },
    }
};

export default model;