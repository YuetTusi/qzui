import { Model, EffectsCommandMap } from "dva";
import { AnyAction } from 'redux';
import unionWith from 'lodash/unionWith';
import CMyPhoneInfo from "@src/schema/CMyPhoneInfo";
import { fetcher } from "@src/service/rpc";
import { helper } from "@src/utils/helper";

/**
 * 仓库Model
 */
interface StoreModel {
    /**
     * 数据
     */
    caseData: CaseDataModel[];
    /**
     * 读取中
     */
    loading: boolean;
}

interface CaseDataModel {
    /**
     * 案件路径
     */
    caseName: string;
    /**
     * 案件路径下的手机数据
     */
    phoneDataList: ExtendMyPhoneInfo[];
}

class ExtendMyPhoneInfo extends CMyPhoneInfo {
    /**
     * 手机名称
     */
    phoneName: string = '';
    /**
     * 创建时间
     */
    createTime: string = '';
}

/**
 * 案件手机子表格Model
 */
let model: Model = {
    namespace: 'innerPhoneTable',
    state: {
        //案件及案件下的手机数据
        caseData: [],
        loading: false
    },
    reducers: {
        setCaseData(state: any, { payload }: AnyAction) {
            //根据案件路径取并集(Union)
            return {
                ...state,
                caseData: unionWith<CaseDataModel>([payload], state.caseData,
                    (store, newly) => store.caseName === newly.caseName)
            };
        },
        setLoading(state: any, { payload }: AnyAction) {
            return {
                ...state,
                loading: payload
            };
        }
    },
    effects: {
        /**
         * 查询案件下的手机列表
         */
        *fetchPhoneDataByCase({ payload }: AnyAction, { call, put }: EffectsCommandMap) {
            yield put({ type: 'setLoading', payload: true });
            try {
                let result: CMyPhoneInfo[] = yield call([fetcher, 'invoke'], 'GetPhoneList', [payload]);
                let list = result.map((item: CMyPhoneInfo) => {
                    let position = item.m_strPhoneName.lastIndexOf('\\');
                    let [phoneName, createTick] = item.m_strPhoneName.substring(position + 1).split('_');
                    return {
                        ...item,
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
            } finally {
                yield put({ type: 'setLoading', payload: false });
            }
        }
    }
}

export { StoreModel, CaseDataModel, ExtendMyPhoneInfo };
export default model;
