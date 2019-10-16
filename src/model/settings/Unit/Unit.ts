import IModel, { IAction, IEffects, IObject } from "@src/type/model";
import { message, notification } from 'antd';
import Rpc from '@src/service/rpc';
import { CFetchCorporation } from '@src/schema/CFetchCorporation';

let rpc = new Rpc();

let model: IModel = {
    namespace: 'unit',
    state: {
        loading: false,
        currentUnit: '',//当前检验单位名
        unitData: [],
        total: 0,//总记录数
        pageIndex: 1,
        pageSize: 10
    },
    reducers: {
        setLoading(state: IObject, { payload }: IAction) {
            return {
                ...state,
                loading: payload
            }
        },
        setUnitData(state: IObject, { payload }: IAction) {
            return {
                ...state,
                unitData: payload.unitData,
                total: payload.total,
                pageIndex: payload.pageIndex
            };
        },
        setCurrentUnit(state: IObject, { payload }: IAction) {
            return {
                ...state,
                currentUnit: payload
            }
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
                console.log(`@model/Unit.ts/queryUnitData:${error.message}`);
                message.error('检验单位查询失败');
            } finally {
                yield put({ type: 'setLoading', payload: false });
            }
        },
        /**
         * 保存检验单位
         */
        *saveUnit(action: IAction, { call, put }: IEffects) {

            const { m_strName, m_strID } = action.payload;
            let entity = new CFetchCorporation();
            entity.m_strID = m_strID;
            entity.m_strName = m_strName;
            entity.m_nCnt = 0;
            try {
                yield call([rpc, 'invoke'], 'SaveFetchCorpInfo', [entity]);
                yield put({ type: 'setCurrentUnit', payload: m_strName });
                message.success('设置成功');
            } catch (error) {
                message.error('保存失败');
                console.error(`@model/Unit.ts/saveUnit: ${error.message}`);
            }
        },
        /**
         * 查询当前检验单位
         */
        *queryCurrentUnit(action: IAction, { call, put }: IEffects) {
            try {
                let entity: CFetchCorporation = yield call([rpc, 'invoke'], 'GetFetchCorpInfo');
                yield put({ type: 'setCurrentUnit', payload: entity.m_strName });
            } catch (error) {
                message.error('查询检验单位失败');
                console.error(`@model/Unit.ts/getUnit: ${error.message}`);
            }
        }
    }
};

export default model;