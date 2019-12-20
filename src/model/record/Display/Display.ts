import IModel, { IAction, IEffects, IObject, ISubParam } from '@type/model';
import CCaseInfo from '@src/schema/CCaseInfo';
import Rpc from "@src/service/rpc";
import { message } from "antd";
import { helper } from '@src/utils/helper';

let rpc: Rpc | null = null;

/**
 * 数据采集首页Model
 * 对应视图: view/record/Display
 */
let model: IModel = {
    namespace: 'display',
    state: {
        //案件表格数据
        caseData: [],
        loading: false
    },
    reducers: {
        setCaseData(state: IObject, action: IAction) {
            return {
                ...state,
                caseData: [...action.payload]
            }
        },
        setLoading(state: IObject, action: IAction) {
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
        *fetchCaseData(action: IAction, { call, put }: IEffects) {
            rpc = new Rpc();
            yield put({ type: 'setLoading', payload: true });
            try {
                let casePath = yield call([rpc, 'invoke'], 'GetDataSavePath');
                let result: CCaseInfo[] = yield call([rpc, 'invoke'], 'GetCaseList', [casePath]);
                result = [{
                    m_strCaseName: '测试',
                    m_bIsAutoParse: true,
                    m_bIsGenerateBCP: false,
                    m_Applist: []
                }];
                result = result.map((item: CCaseInfo) => ({
                    ...item,
                    phoneList: [
                        { col0: 'iPhone7 Plus', col1: '刘某某', col2: '刘警员', col3: ~~(Math.random() * 3), key: helper.getKey() },
                        { col0: 'HUAWEI P30', col1: '刘某某', col2: '刘警员', col3: ~~(Math.random() * 3), key: helper.getKey() },
                        { col0: 'SAMSUNG A90', col1: '张某某', col2: '刘警员', col3: ~~(Math.random() * 3), key: helper.getKey() }
                    ]
                }));
                yield put({ type: 'setCaseData', payload: result });

            } catch (error) {
                console.log(`@modal/Case.ts/fetchCaseData: ${error.message}`);
                message.error('查询案件数据失败');
            } finally {
                yield put({ type: 'setLoading', payload: false });
            }
        }
    },
    subscriptions: {
        /**
         * 发布RPC方法
         */
        remoteMethods({ history, dispatch }: ISubParam) {
            history.listen(({ pathname }: any) => {
                if (pathname === '/record') {
                    rpc = new Rpc('tcp4://127.0.0.1:9000/');
                    rpc.provide([
                        function receiveCaseData(data: CCaseInfo[]) {
                            data = data.map((item: CCaseInfo) => ({
                                ...item,
                                phoneList: [
                                    { col0: 'iPhone7 Plus', col1: '刘某某', col2: '刘警员', col3: ~~(Math.random() * 3), key: helper.getKey() },
                                    { col0: 'HUAWEI P30', col1: '刘某某', col2: '刘警员', col3: ~~(Math.random() * 3), key: helper.getKey() },
                                    { col0: 'SAMSUNG A90', col1: '张某某', col2: '刘警员', col3: ~~(Math.random() * 3), key: helper.getKey() }
                                ]
                            }));
                            dispatch({ type: 'setCaseData', payload: data });
                        }
                    ], 'display');
                } else {
                    rpc!.closeProvider();
                }
            });
        }
    }
};

export default model;