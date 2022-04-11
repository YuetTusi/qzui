
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
        *saveCheckCase({ payload }: AnyAction, { call, fork, put }: EffectsCommandMap) {
            const { m_strCasePath, m_strCaseName } = payload as CCaseInfo;
            const createPath = join(m_strCasePath, m_strCaseName);
            try {
                yield call([ipcRenderer, 'invoke'], 'db-insert', TableName.Case, payload);
                yield put(routerRedux.push('/case'));
                mkdirSync(createPath, { recursive: true });
                yield fork([helper, 'writeCaseJson'], createPath, payload);
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