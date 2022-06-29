import { join } from 'path';
import { AnyAction } from 'redux';
import { EffectsCommandMap } from 'dva';
import { Predict } from '@src/view/case/AISwitch';
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
            const temp: Predict[] = yield call([helper, 'readJSONFile'], tempAt);
            if (casePath === undefined) {
                //无案件目录，是新增，读模版
                yield put({ type: 'setData', payload: temp });
            } else {
                const aiConfigAt = join(casePath, './predict.json'); //当前案件AI路径
                const exist: boolean = yield call([helper, 'existFile'], aiConfigAt);
                if (exist) {
                    //案件下存在，读取案件下的predict.json
                    const caseAi: Predict[] = yield call([helper, 'readJSONFile'], aiConfigAt);
                    const ret = temp.reduce((total: Predict[], current: Predict) => {
                        const next = caseAi.find((i) => i.type === current.type);
                        if (next !== undefined) {
                            total.push({ ...current, use: next.use });
                        } else {
                            total.push(current);
                        }
                        return total;
                    }, []);
                    yield put({ type: 'setData', payload: ret });
                } else {
                    //不存在，读取模版
                    const next: Predict[] = yield call([helper, 'readJSONFile'], tempAt);
                    yield put({ type: 'setData', payload: next });
                }
            }
        } catch (error) {
            console.warn(`读取predict.json失败, @view/default/case/ai-switch:${error.message}`);
            put({ type: 'setData', payload: [] });
        }
    }
};