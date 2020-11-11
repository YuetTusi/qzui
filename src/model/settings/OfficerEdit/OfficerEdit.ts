import { remote } from 'electron';
import { AnyAction } from 'redux';
import { Model, EffectsCommandMap } from 'dva';
import { DbInstance } from '@type/model';
import { Officer } from '@src/schema/Officer';
import { TableName } from '@src/schema/db/TableName';
import message from "antd/lib/message";
import { routerRedux } from 'dva/router';
import { helper } from '@src/utils/helper';

const getDb = remote.getGlobal('getDb');

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
            const db: DbInstance<Officer> = getDb(TableName.Officer);
            let entity: Officer = { ...payload };

            try {
                if (helper.isNullOrUndefined(entity._id)) {
                    //*新增
                    yield call([db, 'insert'], entity);
                } else {
                    //*编辑
                    let origin: Officer = yield call([db, 'findOne'], { _id: entity._id });
                    origin.name = entity.name;
                    origin.no = entity.no;
                    yield call([db, 'update'], { _id: entity._id }, origin);
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