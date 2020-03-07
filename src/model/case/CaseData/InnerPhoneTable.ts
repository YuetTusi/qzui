import { Model, EffectsCommandMap } from "dva";
import { AnyAction } from 'redux';
import unionWith from 'lodash/unionWith';
import { rpc } from "@src/service/rpc";
import { helper } from "@src/utils/helper";

/**
 * 仓库Model
 */
interface StoreModel {
    caseData: CaseDataModel[];
}

interface CaseDataModel {
    /**
     * 案件路径
     */
    caseName: string;
    /**
     * 案件路径下的手机数据
     */
    phoneDataList: PhoneDataModel[];
}

/**
 * 手机数据
 */
interface PhoneDataModel {
    /**
     * 手机数据绝对路径
     */
    phonePath: string;
    /**
     * 手机名称（采集的型号）
     */
    phoneName: string;
    /**
     * 采集时间
     */
    createTime: string;
}

/**
 * 案件手机子表格Model
 */
let model: Model = {
    namespace: 'innerPhoneTable',
    state: {
        //案件及案件下的手机数据
        caseData: [],
    },
    reducers: {
        setCaseData(state: any, { payload }: AnyAction) {
            //根据案件路径取并集(Union)
            return {
                ...state,
                caseData: unionWith<CaseDataModel>([payload], state.caseData,
                    (store, newly) => store.caseName === newly.caseName)
            };
        }
    },
    effects: {
        /**
         * 查询案件下的手机列表
         */
        *fetchPhoneDataByCase({ payload }: AnyAction, { call, put }: EffectsCommandMap) {
            try {
                let result: string[] = yield call([rpc, 'invoke'], 'GetPhoneList', [payload]);
                let list = result.map((item: string) => {
                    let position = item.lastIndexOf('\\');
                    let [phoneName, createTick] = item.substring(position + 1).split('_');
                    return {
                        phonePath: item,
                        phoneName,
                        createTime: helper.parseDate(createTick, 'YYYYMMDDHHmmss').format('YYYY年M月D日 HH:mm:ss')
                    };
                });
                yield put({
                    type: 'setCaseData', payload: {
                        caseName: payload,
                        phoneDataList: list
                    }
                });
            } catch (error) {
                console.log(`@modal/CaseData.ts/fetchCaseData: ${error.message}`);
            }
        }
    }
}

export { StoreModel, CaseDataModel, PhoneDataModel };
export default model;
