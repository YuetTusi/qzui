
import { mkdirSync } from 'fs';
import { join } from 'path';
import { AnyAction } from 'redux';
import { ipcRenderer } from 'electron';
import { EffectsCommandMap, Model } from 'dva';
import { routerRedux } from 'dva/router';
import message from 'antd/lib/message';
import { TableName } from '@src/schema/db/TableName';
import CCaseInfo from '@src/schema/CCaseInfo';
import { helper } from '@src/utils/helper';
import logger from '@src/utils/log';
import { StateTree } from '@src/type/model';
import { AiSwitchState } from '@src/model/case/AISwitch';
import { PredictJson } from '@src/view/case/AISwitch/prop';

const cwd = process.cwd();
const isDev = process.env['NODE_ENV'] === 'development';

interface MenuStoreState { }

let model: Model = {
    namespace: 'menu',
    state: {},
    reducers: {},
    effects: {
        /**
         * 保存快速点验
         * @param CCaseInfo payload 案件
         */
        *saveCheckCase({ payload }: AnyAction, { call, fork, put, select }: EffectsCommandMap) {
            const { m_strCasePath, m_strCaseName } = payload as CCaseInfo;
            const createPath = join(m_strCasePath, m_strCaseName);
            const tempAt = isDev
                ? join(cwd, './data/predict.json')
                : join(cwd, './resources/config/predict.json'); //模版路径
            try {
                const temp: PredictJson = yield call([helper, 'readJSONFile'], tempAt);
                const aiSwitch: AiSwitchState = yield select((state: StateTree) => state.aiSwitch);
                yield call([ipcRenderer, 'invoke'], 'db-insert', TableName.Case, payload);
                yield put(routerRedux.push('/case'));
                mkdirSync(createPath, { recursive: true });
                yield fork([helper, 'writeCaseJson'], createPath, payload);
                yield fork([helper, 'writeJSONfile'], join(createPath, 'predict.json'), {
                    ...temp,
                    config: aiSwitch.data,
                    similarity: aiSwitch.similarity,
                    ocr: aiSwitch.ocr
                }); //写ai配置JSON
                message.success('保存成功');
            } catch (error) {
                console.error(`@modal/tools/Menu/Menu.ts/saveCheckCase: ${error.message}`);
                logger.error(`@modal/tools/Menu/Menu.ts/saveCheckCase:${error.message}`);
                message.error('保存失败');
            } finally {
                yield put({ type: 'setSaving', payload: false });
            }
        }
    }
};

export { MenuStoreState };
export default model;