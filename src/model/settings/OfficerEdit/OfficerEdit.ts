import { ipcRenderer } from 'electron';
import { AnyAction } from 'redux';
import { Model, EffectsCommandMap } from 'dva';
import { Officer } from '@src/schema/Officer';
import { TableName } from '@src/schema/db/TableName';
import message from "antd/lib/message";
import { routerRedux } from 'dva/router';
import { helper } from '@src/utils/helper';

/**
 * 仓库数据
 */
interface StoreData {
    officerData: Officer | null
}

/**
 * 新增/编辑检验员Model
 */
let model: Model = {
    namespace: 'officerEdit',
    state: {
        officerData: null
    },
    effects: {
        /**
         * 保存检验员
         */
        *saveOfficer({ payload }: AnyAction, { call, put }: EffectsCommandMap) {
            let entity: Officer = { ...payload };

            try {
                if (helper.isNullOrUndefined(entity._id)) {
                    //*新增
                    yield call([ipcRenderer, 'invoke'], 'db-insert', TableName.Officer, entity);
                } else {
                    //*编辑
                    let origin: Officer = yield call([ipcRenderer, 'invoke'], 'db-find-one', TableName.Officer, { _id: entity._id });
                    origin.name = entity.name;
                    origin.no = entity.no;
                    yield call([ipcRenderer, 'invoke'], 'db-update', TableName.Officer, { _id: entity._id }, origin);
                }

                yield put(routerRedux.push('/settings/officer'));
                message.success('保存成功');
            } catch (error) {
                message.error('保存失败');
                console.error(`@model/OfficeEdit.ts/saveOfficer:${error.message}`);
            }
        }
    }
};

export { StoreData };
export default model;