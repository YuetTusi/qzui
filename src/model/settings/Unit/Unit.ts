import IModel, { IAction, IEffects, IObject } from "@src/type/model";
import { message } from 'antd';
import Rpc from '@src/service/rpc';
import { CFetchCorporation } from '@src/schema/CFetchCorporation';

let rpc = new Rpc();

let model: IModel = {
    namespace: 'unit',
    state: {
        loading: false,
        unitData: [],
        total: 0,
        pageIndex: 1,
        pageSize: 10
    },
    reducers: {
        setLoading(state: IObject, action: IAction) {
            return {
                ...state,
                loading: action.payload
            }
        },
        setUnitData(state: IObject, action: IAction) {
            return {
                ...state,
                unitData: action.payload.unitData,
                total: action.payload.total,
                pageIndex: action.payload.pageIndex
            };
        }
    },
    effects: {
        /**
         * 查询检验单位表格
         */
        *queryUnitData(action: IAction, { call, put }: IEffects) {
            const { keyword, pageIndex } = action.payload;
            let skip = (pageIndex - 1) * 10;
            yield put({ type: 'setLoading', payload: true });
            try {
                let result: CFetchCorporation[] =
                    yield call([rpc, 'invoke'], 'GetFetchCorporation', [keyword, skip]);
                if (result.length === 0) {
                    yield put({
                        type: 'setUnitData', payload: {
                            unitData: [],
                            pageIndex,
                            total: 0
                        }
                    });
                } else {
                    yield put({
                        type: 'setUnitData', payload: {
                            unitData: result,
                            pageIndex,
                            total: result[0].m_nCnt
                        }
                    });
                }
            } catch (error) {
                console.log(`@model/Unit.ts:${error.message}`);
                message.error('检验单位查询失败');
            } finally {
                yield put({ type: 'setLoading', payload: false });
            }
        }
    }
};

export default model;