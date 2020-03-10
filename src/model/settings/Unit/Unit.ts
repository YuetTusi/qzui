import { AnyAction } from 'redux';
import { Model, EffectsCommandMap } from 'dva';
import message from 'antd/lib/message';
import { Fetch } from '@src/service/rpc';
import { CCheckOrganization } from '@src/schema/CCheckOrganization';

let model: Model = {
    namespace: 'unit',
    state: {
        loading: false,
        currentUnit: '',//当前检验单位名
        currentUnitID: '',//当前检验单位编号
        unitData: [],
        total: 0,//总记录数
        pageIndex: 1,
        pageSize: 10
    },
    reducers: {
        setLoading(state: any, { payload }: AnyAction) {
            return {
                ...state,
                loading: payload
            }
        },
        setUnitData(state: any, { payload }: AnyAction) {
            return {
                ...state,
                unitData: payload.unitData,
                total: payload.total,
                pageIndex: payload.pageIndex
            };
        },
        setCurrentUnit(state: any, { payload }: AnyAction) {
            return {
                ...state,
                currentUnit: payload.m_strCheckOrganizationName,
                currentUnitID: payload.m_strCheckOrganizationID
            }
        }
    },
    effects: {
        /**
         * 查询检验单位表格
         */
        *queryUnitData(action: AnyAction, { call, put }: EffectsCommandMap) {
            const { keyword, pageIndex } = action.payload;
            let skip = (pageIndex - 1) * 10;
            yield put({ type: 'setLoading', payload: true });
            try {
                let result: CCheckOrganization[] =
                    yield call([Fetch, 'invoke'], 'GetCheckOrganizationList', [keyword, skip]);
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
            } finally {
                yield put({ type: 'setLoading', payload: false });
            }
        },
        /**
         * 保存检验单位
         */
        *saveUnit(action: AnyAction, { call, put }: EffectsCommandMap) {

            const { m_strCheckOrganizationName, m_strCheckOrganizationID } = action.payload;
            let entity = new CCheckOrganization();
            entity.m_strCheckOrganizationID = m_strCheckOrganizationID;
            entity.m_strCheckOrganizationName = m_strCheckOrganizationName;
            entity.m_nCnt = 0;
            try {
                yield call([Fetch, 'invoke'], 'SaveCheckOrganizationInfo', [entity]);
                yield put({ type: 'setCurrentUnit', payload: entity });
                message.success('设置成功');
            } catch (error) {
                message.error('保存失败');
                console.error(`@model/Unit.ts/saveUnit: ${error.message}`);
            }
        },
        /**
         * 查询当前检验单位
         */
        *queryCurrentUnit(action: AnyAction, { call, put }: EffectsCommandMap) {
            try {
                let entity: CCheckOrganization = yield call([Fetch, 'invoke'], 'GetCurCheckOrganizationInfo');
                yield put({ type: 'setCurrentUnit', payload: entity });
            } catch (error) {
                console.error(`@model/Unit.ts/queryCurrentUnit: ${error.message}`);
            }
        }
    }
};

export default model;