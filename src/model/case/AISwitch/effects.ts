import { join } from 'path';
import { AnyAction } from 'redux';
import { EffectsCommandMap } from 'dva';
import { Predict } from '@src/view/case/AISwitch';
import { PredictComp } from '@src/view/case/AISwitch/prop';
import { helper } from '@src/utils/helper';



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
                yield put({ type: 'setData', payload: (temp as { config: Predict[] }).config });
                yield put({ type: 'setSimilarity', payload: (temp as { similarity: number }).similarity });
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
                        yield put({ type: 'setSimilarity', payload: 0 });
                    } else {
                        const ret: { config: Predict[], similarity: number } = { config: [], similarity: caseAi.similarity };
                        ret.config = (temp as { config: Predict[], similarity: number })
                            .config
                            .reduce((total: Predict[], current: Predict) => {
                                const next = (caseAi as { config: Predict[], similarity: number })
                                    .config
                                    .find((i) => i.type === current.type);
                                if (next !== undefined) {
                                    total.push({ ...current, use: next.use });
                                } else {
                                    total.push(current);
                                }
                                return total;
                            }, []);
                        yield put({ type: 'setData', payload: ret.config });
                        yield put({ type: 'setSimilarity', payload: ret.similarity });
                    }
                } else {
                    //不存在，读取模版
                    const next: PredictComp = yield call([helper, 'readJSONFile'], tempAt);
                    yield put({ type: 'setData', payload: (next as { config: Predict[] }).config });
                    yield put({ type: 'setSimilarity', payload: (next as { similarity: number }).similarity });
                }
            }
        } catch (error) {
            console.warn(`读取predict.json失败, @model/case/AISwitch:${error.message}`);
            yield put({ type: 'setData', payload: [] });
            yield put({ type: 'setSimilarity', payload: 0 });
        }
    }
};