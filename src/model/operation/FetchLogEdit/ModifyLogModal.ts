import { Model, EffectsCommandMap } from 'dva';
import { AnyAction } from 'redux';
import CFetchLog from '@src/schema/CFetchLog';
import Db from '@src/utils/Db';

interface StoreData {
    /**
     * 编辑的日志对象
     */
    entity: CFetchLog;
}

let model: Model = {
    namespace: 'modifyLogModal',
    state: {},
    effects: {}
};

export { StoreData };
export default model;