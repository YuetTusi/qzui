import { IModel, IObject, IAction, IEffects } from '@type/model';
import Rpc from '@src/service/rpc';
import { message } from 'antd';

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
        //检验单位
        unit: null,
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
                unit: action.payload.unit,
                unitCode: action.payload.unitCode
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
        }
    }
};


export default model;