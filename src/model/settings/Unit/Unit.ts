import IModel, { IAction, IEffects, IObject } from "@src/type/model";
import { message, notification } from 'antd';
import Rpc from '@src/service/rpc';
import { CCheckOrganization } from '@src/schema/CCheckOrganization';

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
                let result: CCheckOrganization[] =
                    yield call([rpc, 'invoke'], 'GetCheckOrganizationList', [keyword, skip]);
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

            const { m_strCheckOrganizationName, m_strCheckOrganizationID } = action.payload;
            let entity = new CCheckOrganization();
            entity.m_strCheckOrganizationID = m_strCheckOrganizationID;
            entity.m_strCheckOrganizationName = m_strCheckOrganizationName;
            entity.m_nCnt = 0;
            try {
                yield call([rpc, 'invoke'], 'SaveCheckOrganizationInfo', [entity]);
                yield put({ type: 'setCurrentUnit', payload: m_strCheckOrganizationName });
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
                let entity: CCheckOrganization = yield call([rpc, 'invoke'], 'GetCurCheckOrganizationInfo');
                yield put({ type: 'setCurrentUnit', payload: entity.m_strCheckOrganizationName });
            } catch (error) {
                message.error('查询检验单位失败');
                console.error(`@model/Unit.ts/queryCurrentUnit: ${error.message}`);
            }
        }
    }
};

export default model;