// import { fetcher } from '@src/service/rpc';
import { AnyAction } from 'redux';
import { Model, EffectsCommandMap } from 'dva';
import { CCaseInfo } from '@src/schema/CCaseInfo';
import { CCheckerInfo } from '@src/schema/CCheckerInfo';
import { CCheckOrganization } from '@src/schema/CCheckOrganization';
import { FetchTypeNameItem } from '@src/schema/FetchTypeNameItem';
import logger from '@src/utils/log';
import Db from '@utils/db';
import { TableName } from '@src/schema/db/TableName';

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
 * 导入数据输入框
 */
let model: Model = {
    namespace: 'importDataModal',
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
            const db = new Db<CCaseInfo>(TableName.Case);
            try {
                let list: CCaseInfo[] = yield call([db, 'find'], null);
                yield put({ type: 'setCaseList', payload: list });
            } catch (error) {
                console.log(`@model/tools/Menu/ImportDataModal.ts/queryCaseList:${error.message}`);
                logger.error({ message: `@model/tools/Menu/ImportDataModal.ts/queryCaseList: ${error.stack}` });
            }
        },
        /**
         * 查询检验员下拉数据
         */
        *queryOfficerList(action: AnyAction, { call, put }: EffectsCommandMap) {
            try {
                //let result = yield call([fetcher, 'invoke'], 'GetCheckerInfo', []);
                yield put({ type: 'setOfficerList', payload: [] });
            } catch (error) {
                console.log(`@model/tools/Menu/ImportDataModal.ts/queryOfficerList:${error.message}`);
                logger.error({ message: `@model/tools/Menu/ImportDataModal.ts/queryOfficerList: ${error.stack}` });
            }
        },
        /**
         * 查询当前检验单位
         */
        *queryUnit(action: AnyAction, { call, put }: EffectsCommandMap) {
            try {
                //let entity: CCheckOrganization = yield call([fetcher, 'invoke'], 'GetCurCheckOrganizationInfo');
                yield put({
                    type: 'setUnit', payload: {
                        unitName: '',
                        unitCode: ''
                    }
                });
            } catch (error) {
                console.log(`@model/tools/Menu/ImportDataModal.ts/queryUnit:${error.message}`);
                logger.error({ message: `@model/tools/Menu/ImportDataModal.ts/queryUnit: ${error.stack}` });
            }
        },
        /**
         * 查询检验单位下拉数据
         */
        *queryUnitData(action: AnyAction, { call, put }: EffectsCommandMap) {
            try {
                //let result = yield call([fetcher, 'invoke'], 'GetCheckOrganizationList', [action.payload, 0]);
                yield put({ type: 'setUnitList', payload: [] });
            } catch (error) {
                console.log(`@model/tools/Menu/ImportDataModal.ts/queryUnitData:${error.message}`);
                logger.error({ message: `@model/tools/Menu/ImportDataModal.ts/queryUnitData: ${error.stack}` });
            }
        },
        /**
         * 查询采集方式下拉数据
         */
        *queryCollectTypeData({ payload }: AnyAction, { call, put }: EffectsCommandMap) {
            try {
                //let result: FetchTypeNameItem[] = yield call([fetcher, 'invoke'], 'GetFetchTypeList', ['ThirdData']);
                yield put({ type: 'setCollectTypeList', payload: [] });
            } catch (error) {
                console.log(`@model/tools/Menu/ImportDataModal.ts/queryCollectTypeData:${error.message}`);
                logger.error({ message: `@model/tools/Menu/ImportDataModal.ts/queryCollectTypeData: ${error.stack}` });
            }
        }
    }
};

export { StoreData };
export default model;