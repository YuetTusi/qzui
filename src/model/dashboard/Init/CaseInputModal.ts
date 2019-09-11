import { IModel, IObject, IAction } from '@type/model';

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
        //采集单位列表
        unitList: []
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
        setUnitList(state: IObject, action: IAction) {
            return { ...state, unitList: [...action.payload] };
        }
    }
};


export default model;