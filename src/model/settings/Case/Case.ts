import { rpc } from "@src/service/rpc";
import message from "antd/lib/message";
import { Model, EffectsCommandMap } from "dva";
import { AnyAction } from 'redux';
import CCaseInfo from "@src/schema/CCaseInfo";
import { helper } from '@src/utils/helper';

let model: Model = {
    namespace: 'case',
    state: {
        //案件表格数据
        caseData: [],
        loading: false
    },
    reducers: {
        setCaseData(state: any, action: AnyAction) {
            return {
                ...state,
                caseData: [...action.payload]
            }
        },
        setLoading(state: any, action: AnyAction) {
            return {
                ...state,
                loading: action.payload
            }
        }
    },
    effects: {
        /**
         * 查询案件列表
         */
        *fetchCaseData(action: AnyAction, { call, put }: EffectsCommandMap) {
            yield put({ type: 'setLoading', payload: true });
            try {
                let casePath = yield call([rpc, 'invoke'], 'GetDataSavePath');
                let result: CCaseInfo[] = yield call([rpc, 'invoke'], 'GetCaseList', [casePath]);
                //将时间戳拆分出来，转为创建时间列来显示
                let temp = result.map((item: CCaseInfo) => {
                    return {
                        ...item,
                        caseName: item.m_strCaseName.split('_')[0],
                        createTime: helper.parseDate(item.m_strCaseName.split('_')[1], 'YYYYMMDDHHmmSSSS').format('YYYY年M月D日 HH:mm:SS')
                    }
                });
                yield put({ type: 'setCaseData', payload: temp });
            } catch (error) {
                console.log(`@modal/Case.ts/fetchCaseData: ${error.message}`);
                message.error('查询案件数据失败');
            } finally {
                yield put({ type: 'setLoading', payload: false });
            }
        },
        /**
         * 删除案件(参数传案件完整路径)
         */
        *deleteCaseData(action: AnyAction, { call, put }: EffectsCommandMap) {
            try {
                yield call([rpc, 'invoke'], 'DeleteCaseInfo', [action.payload]);
                yield put({ type: 'fetchCaseData' });
                message.success('删除成功');
            } catch (error) {
                message.error('删除失败');
                console.log(`@modal/Case.ts/deleteCaseData: ${error.message}`);
            } finally {
                yield put({ type: 'setLoading', payload: false });
            }
        }
    }
};

export default model;