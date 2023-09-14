import { join } from 'path';
import { ipcRenderer } from 'electron';
import { AnyAction } from 'redux';
import { EffectsCommandMap } from 'dva';
import { Predict } from '@src/view/case/AISwitch';
import { PredictComp, PredictJson } from '@src/view/case/AISwitch/prop';
import { helper } from '@src/utils/helper';
import { TableName } from '@src/schema/db/TableName';
import CCaseInfo from '@src/schema/CCaseInfo';

const cwd = process.cwd();
const isDev = process.env['NODE_ENV'] === 'development';

export default {

    /**
     * 读取案件下predict.json或模版JSON
     * @param {string} payload.casePath 案件路径 （如果案件下无predict.json，读取模版文件）
     */
    *readAiConfig({ payload }: AnyAction, { call, put }: EffectsCommandMap) {
        const tempAt = isDev
            ? join(cwd, './data/predict.json')
            : join(cwd, './resources/config/predict.json'); //模版路径
        const { casePath } = payload as { casePath: string };
        try {
            const temp: PredictComp = yield call([helper, 'readJSONFile'], tempAt);
            if (casePath === undefined) {
                //无案件目录，是新增，读模版
                yield put({ type: 'setData', payload: (temp as PredictJson).config });
                yield put({ type: 'setSimilarity', payload: (temp as PredictJson).similarity });
                yield put({ type: 'setOcr', payload: (temp as PredictJson).ocr });
            } else {
                const aiConfigAt = join(casePath, './predict.json'); //当前案件AI路径
                const exist: boolean = yield call([helper, 'existFile'], aiConfigAt);
                if (exist) {
                    //案件下存在，读取案件下的predict.json
                    const caseAi: PredictComp = yield call([helper, 'readJSONFile'], aiConfigAt);

                    if (Array.isArray(caseAi)) {
                        const ret = (caseAi as Predict[]).reduce((total: Predict[], current: Predict) => {
                            const next = caseAi.find((i) => i.type === current.type);
                            if (next !== undefined) {
                                total.push({ ...current, use: next.use });
                            } else {
                                total.push(current);
                            }
                            return total;
                        }, []);
                        yield put({ type: 'setData', payload: ret });
                        yield put({ type: 'setSimilarity', payload: (temp as PredictJson).similarity });
                        yield put({ type: 'setOcr', payload: (temp as PredictJson).ocr });
                    } else {
                        yield put({ type: 'setData', payload: (caseAi as PredictJson).config });
                        yield put({ type: 'setSimilarity', payload: (caseAi as PredictJson).similarity });
                        yield put({ type: 'setOcr', payload: (caseAi as PredictJson).ocr });
                    }
                } else {
                    //不存在，读取模版
                    yield put({ type: 'setData', payload: (temp as { config: Predict[] }).config });
                    yield put({ type: 'setSimilarity', payload: (temp as { similarity: number }).similarity });
                    yield put({ type: 'setOcr', payload: (temp as PredictJson).ocr });
                }
            }
        } catch (error) {
            console.warn(`读取predict.json失败, @model/case/AISwitch:${error.message}`);
            yield put({ type: 'setData', payload: [] });
            yield put({ type: 'setSimilarity', payload: 0 });
            yield put({ type: 'setOcr', payload: false });
        }
    },
    *readAiConfigByCaseId({ payload }: AnyAction, { call, put }: EffectsCommandMap) {
        const tempAt = isDev
            ? join(cwd, './data/predict.json')
            : join(cwd, './resources/config/predict.json'); //模版路径
        try {
            const temp: PredictComp = yield call([helper, 'readJSONFile'], tempAt);
            const caseData: CCaseInfo = yield call([ipcRenderer, 'invoke'], 'db-find-one', TableName.Case, { _id: payload });
            if (caseData) {
                const { m_strCasePath, m_strCaseName } = caseData;
                const casePath = join(m_strCasePath, m_strCaseName);
                const aiConfigAt = join(casePath, './predict.json'); //当前案件AI路径
                const exist: boolean = yield call([helper, 'existFile'], aiConfigAt);
                if (exist) {
                    //案件下存在，读取案件下的predict.json
                    const caseAi: PredictComp = yield call([helper, 'readJSONFile'], aiConfigAt);

                    yield put({ type: 'setData', payload: (caseAi as PredictJson).config });
                    yield put({ type: 'setSimilarity', payload: (caseAi as PredictJson).similarity });
                    yield put({ type: 'setOcr', payload: (caseAi as PredictJson).ocr });
                } else {
                    //不存在，读取模版ft
                    yield put({ type: 'setData', payload: (temp as { config: Predict[] }).config });
                    yield put({ type: 'setSimilarity', payload: (temp as { similarity: number }).similarity });
                    yield put({ type: 'setOcr', payload: (temp as PredictJson).ocr });
                }
            } else {
                //不存在，读取模版ft
                yield put({ type: 'setData', payload: (temp as { config: Predict[] }).config });
                yield put({ type: 'setSimilarity', payload: (temp as { similarity: number }).similarity });
                yield put({ type: 'setOcr', payload: (temp as PredictJson).ocr });
            }
        } catch (error) {
            console.clear();
            console.warn(error);
        }
    }
};