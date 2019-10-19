import { IModel, IObject, IAction, IEffects } from '@type/model';
import Rpc from '@src/service/rpc';
import { message } from 'antd';
import { CFetchCorporation } from '@src/schema/CFetchCorporation';

const rpc = new Rpc();

/**
 * 案件输入框
 */
let model: IModel = {
    namespace: 'caseInputModal',
    state: {
        //案件列表
        caseList: [],
        //手机名称
        piMakerName: null,
        //检验员列表
        officerList: [],
        //检验单位列表
        unitList: [],
        //查询状态
        fetching: false,
        //检验单位名
        unitName: null,
        //检验单位Code,
        unitCode: null,
        //序列号
        piSerialNumber: null,
        //物理USB端口
        //piLocationID:null,
    },
    reducers: {
        setCaseList(state: IObject, action: IAction) {
            return { ...state, caseList: [...action.payload] };
        },
        setPiMakerName(state: IObject, action: IAction) {
            return { ...state, piMakerName: action.payload };
        },
        setOfficerList(state: IObject, action: IAction) {
            return { ...state, officerList: [...action.payload] };
        },
        setUnit(state: IObject, action: IAction) {
            return {
                ...state,
                unitName: action.payload.unitName,
                unitCode: action.payload.unitCode
            };
        },
        setUnitList(state: IObject, action: IAction) {
            return {
                ...state,
                unitList: [...action.payload]
            };
        },
        setFetching(state: IObject, action: IAction) {
            return {
                ...state,
                fetching: action.payload
            };
        }
    },
    effects: {
        /**
         * 查询案件下拉列表数据
         */
        *queryCaseList(action: IAction, { call, put }: IEffects) {
            try {
                let casePath = yield call([rpc, 'invoke'], 'GetDataSavePath');
                let result = yield call([rpc, 'invoke'], 'GetCaseList', [casePath]);
                yield put({ type: 'setCaseList', payload: result });
            } catch (error) {
                message.destroy();
                message.error('案件数据读取失败');
                console.log(`@model/dashboard/Init/CaseInputModal.ts/queryCaseList:${error.message}`);
            }
        },
        /**
         * 查询检验员下拉数据
         */
        *queryOfficerList(action: IAction, { call, put }: IEffects) {
            try {
                let result = yield call([rpc, 'invoke'], 'GetCoronerInfo', []);
                yield put({ type: 'setOfficerList', payload: result });
            } catch (error) {
                message.destroy();
                message.error('检验员数据读取失败');
                console.log(`@model/dashboard/Init/CaseInputModal.ts/queryOfficerList:${error.message}`);
            }
        },
        /**
         * 查询当前检验单位
         */
        *queryUnit(action: IAction, { call, put }: IEffects) {
            try {
                let entity: CFetchCorporation = yield call([rpc, 'invoke'], 'GetFetchCorpInfo');
                yield put({
                    type: 'setUnit', payload: {
                        unitName: entity.m_strName,
                        unitCode: entity.m_strID
                    }
                });
            } catch (error) {
                console.log(`@modal/dashboard/Init/CaseInputModal.ts/queryUnit:${error.message}`);
                message.error('查询检验单位数据失败');
            }
        },
        /**
         * 查询检验单位下拉数据
         */
        *queryUnitData(action: IAction, { call, put }: IEffects) {
            try {
                let result = yield call([rpc, 'invoke'], 'GetFetchCorporation', [action.payload, 0]);
                yield put({ type: 'setUnitList', payload: result });
            } catch (error) {
                console.log(`@modal/dashboard/Init/CaseInputModal.ts/queryUnitData:${error.message}`);
                message.error('查询检验单位下拉数据失败');
            } finally {
                yield put({ type: 'setFetching', payload: false });
            }
        }
    }
};


export default model;