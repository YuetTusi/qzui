import { IModel, IObject, IAction } from '@type/model';
import { string } from 'prop-types';

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
        //警员列表
        policeList: [],
        //采集单位
        unit: null,
        //采集单位Code,
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
        setPoliceList(state: IObject, action: IAction) {
            return { ...state, policeList: [...action.payload] };
        },
        setUnit(state: IObject, action: IAction) {
            return {
                ...state,
                unit: action.payload.unit,
                unitCode: action.payload.unitCode
            };
        }
    }
};


export default model;