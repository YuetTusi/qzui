import { rpc } from '@src/service/rpc';
import logger from '@src/utils/log';
import { Model, EffectsCommandMap } from 'dva';
import { AnyAction } from 'redux';
import CCaseInfo from '@src/schema/CCaseInfo';
import { CCheckerInfo } from '@src/schema/CCheckerInfo';
import { CCheckOrganization } from '@src/schema/CCheckOrganization';
import FetchTypeNameItem from '@src/schema/FetchTypeNameItem';

interface StoreData {
    /**
     * 案件列表
     */
    caseList: CCaseInfo[];
    /**
     * 手机名称
     */
    piMakerName: string | null;
    /**
     * 检验员列表
     */
    officerList: CCheckerInfo[];
    /**
     * 检验单位列表
     */
    unitList: CCheckOrganization[];
    /**
     * 采集方式列表
     */
    collectTypeList: FetchTypeNameItem[];
    /**
     * 查询状态(小菊花)
     */
    fetching: boolean;
    /**
     * 检验单位名
     */
    unitName: string | null;
    /**
     * 检验单位Code
     */
    unitCode: string | null;
    /**
     * 设备序列号
     */
    piSerialNumber: string | null;
}

/**
 * 案件输入框
 */
let model: Model = {
    namespace: 'caseInputModal',
    state: {
        caseList: [],
        piMakerName: null,
        officerList: [],
        unitList: [],
        collectTypeList: [],
        fetching: false,
        unitName: null,
        unitCode: null,
        piSerialNumber: null,
    },
    reducers: {
        setCaseList(state: any, action: AnyAction) {
            return { ...state, caseList: [...action.payload] };
        },
        setPiMakerName(state: any, action: AnyAction) {
            return { ...state, piMakerName: action.payload };
        },
        setOfficerList(state: any, action: AnyAction) {
            return { ...state, officerList: [...action.payload] };
        },
        setUnit(state: any, action: AnyAction) {
            return {
                ...state,
                unitName: action.payload.unitName,
                unitCode: action.payload.unitCode
            };
        },
        setUnitList(state: any, action: AnyAction) {
            return {
                ...state,
                unitList: [...action.payload]
            };
        },
        setCollectTypeList(state: any, action: AnyAction) {
            return {
                ...state,
                collectTypeList: [...action.payload]
            }
        }
    },
    effects: {
        /**
         * 查询案件下拉列表数据
         */
        *queryCaseList(action: AnyAction, { call, put }: EffectsCommandMap) {
            try {
                let casePath = yield call([rpc, 'invoke'], 'GetDataSavePath');
                let result = yield call([rpc, 'invoke'], 'GetCaseList', [casePath]);
                yield put({ type: 'setCaseList', payload: result });
            } catch (error) {
                console.log(`@model/dashboard/Init/CaseInputModal.ts/queryCaseList:${error.message}`);
                logger.error({ message: `@model/dashboard/Init/CaseInputModal.ts/queryCaseList: ${error.stack}` });
            }
        },
        /**
         * 查询检验员下拉数据
         */
        *queryOfficerList(action: AnyAction, { call, put }: EffectsCommandMap) {
            try {
                let result = yield call([rpc, 'invoke'], 'GetCheckerInfo', []);
                yield put({ type: 'setOfficerList', payload: result });
            } catch (error) {
                console.log(`@model/dashboard/Init/CaseInputModal.ts/queryOfficerList:${error.message}`);
                logger.error({ message: `@model/dashboard/Init/CaseInputModal.ts/queryOfficerList: ${error.stack}` });
            }
        },
        /**
         * 查询当前检验单位
         */
        *queryUnit(action: AnyAction, { call, put }: EffectsCommandMap) {
            try {
                let entity: CCheckOrganization = yield call([rpc, 'invoke'], 'GetCurCheckOrganizationInfo');
                yield put({
                    type: 'setUnit', payload: {
                        unitName: entity.m_strCheckOrganizationName,
                        unitCode: entity.m_strCheckOrganizationID
                    }
                });
            } catch (error) {
                console.log(`@modal/dashboard/Init/CaseInputModal.ts/queryUnit:${error.message}`);
                logger.error({ message: `@modal/dashboard/Init/CaseInputModal.ts/queryUnit: ${error.stack}` });
            }
        },
        /**
         * 查询检验单位下拉数据
         */
        *queryUnitData(action: AnyAction, { call, put }: EffectsCommandMap) {
            try {
                let result = yield call([rpc, 'invoke'], 'GetCheckOrganizationList', [action.payload, 0]);
                yield put({ type: 'setUnitList', payload: result });
            } catch (error) {
                console.log(`@modal/dashboard/Init/CaseInputModal.ts/queryUnitData:${error.message}`);
                logger.error({ message: `@modal/dashboard/Init/CaseInputModal.ts/queryUnitData: ${error.stack}` });
            }
        },
        /**
         * 查询采集方式下拉数据
         */
        *queryCollectTypeData({ payload }: AnyAction, { call, put }: EffectsCommandMap) {
            const { piSerialNumber, piLocationID } = payload;
            try {
                let result: FetchTypeNameItem[] = yield call([rpc, 'invoke'], 'GetFetchTypeList', [piSerialNumber + piLocationID]);
                yield put({ type: 'setCollectTypeList', payload: result });
            } catch (error) {
                console.log(`@modal/dashboard/Init/CaseInputModal.ts/queryCollectTypeData:${error.message}`);
                logger.error({ message: `@modal/dashboard/Init/CaseInputModal.ts/queryCollectTypeData: ${error.stack}` });
            }
        }
    }
};

export { StoreData };
export default model;