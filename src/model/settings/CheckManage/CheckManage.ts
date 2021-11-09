import { ipcRenderer } from 'electron';
import { AnyAction } from 'redux';
import { Model, EffectsCommandMap } from 'dva';
import message from 'antd/lib/message';
import { helper } from '@utils/helper';
import logger from '@utils/log';
import { DbInstance } from '@type/model';
import { TableName } from '@src/schema/db/TableName';
import { FetchData } from '@src/schema/socket/FetchData';

const defaultPageSize = 10;

interface CheckManageModelState {
    /**
     * 表格数据
     */
    data: FetchData[],
    /**
     * 当前页
     */
    current: number,
    /**
     * 页尺寸
     */
    pageSize: number,
    /**
     * 记录总数
     */
    total: number,
    /**
     * 加载中
     */
    loading: boolean,
    /**
     * 当前正在编辑的对象
     */
    editEntity: FetchData | null
}

/**
 * 点验设备数据Model
 */
let model: Model = {
    namespace: 'checkManage',
    state: {
        data: [],
        current: 1,
        pageSize: defaultPageSize,
        total: 0,
        loading: false,
        editEntity: null
    },
    reducers: {
        setData(state: any, { payload }: AnyAction) {
            state.data = payload;
            return state;
        },
        setPage(state: any, { payload }: AnyAction) {
            state.current = payload.current;
            state.pageSize = payload.pageSize;
            state.total = payload.total;
            return state;
        },
        setEditEnitity(state: any, { payload }: AnyAction) {
            state.editEntity = payload;
            return state;
        },
        setLoading(state: any, { payload }: AnyAction) {
            state.loading = payload;
            return state;
        }
    },
    effects: {
        /**
         * 查询点验设备表格数据
         * @param payload.condition 查询条件
         * @param payload.current 当前页
         * @param payload.pageSize 页尺寸
         */
        *queryCheckData({ payload }: AnyAction, { all, call, put }: EffectsCommandMap) {
            const { current, pageSize } = payload;
            const condition: Record<string, any> = {};
            yield put({ type: 'setLoading', payload: true });
            if (!helper.isNullOrUndefined(payload?.condition?.mobileHolder)) {
                condition.mobileHolder = { $regex: new RegExp(`${payload?.condition?.mobileHolder}`) };
            }
            try {
                let [data, total]: [FetchData[], number] = yield all([
                    call([ipcRenderer, 'invoke'], 'db-find-by-page', TableName.CheckData,
                        { ...condition }, current, pageSize ?? defaultPageSize, 'createdAt', -1),
                    call([ipcRenderer, 'invoke'], 'db-count', TableName.CheckData, { ...condition })
                ]);
                yield put({
                    type: 'setPage', payload: {
                        current,
                        pageSize: pageSize ?? defaultPageSize,
                        total
                    }
                });
                yield put({ type: 'setData', payload: data });
            } catch (error) {
                logger.error(`查询点验设备数据失败 @model/settings/CheckManage/queryCheckData ${error.message}`);
            } finally {
                yield put({ type: 'setLoading', payload: false });
            }
        },
        /**
         * 根据序列号查询
         * @param {string} payload 序列号
         */
        *queryBySerial({ payload }: AnyAction, { call, put }: EffectsCommandMap) {
            try {
                let entity: FetchData | null = yield call([ipcRenderer, 'invoke'], 'db-find-one', TableName.CheckData, { serial: payload });
                yield put({ type: 'setEditEnitity', payload: entity });
            } catch (error) {
                message.destroy();
                message.error('数据查询失败');
                logger.error(`查询点验设备数据失败 @model/settings/CheckManage/queryBySerial ${error.message}`);
            }
        },
        /**
         * 更新数据
         * @param {FetchData} payload
         */
        *updateCheckData({ payload }: AnyAction, { call, put }: EffectsCommandMap) {
            try {
                let data: FetchData = yield call([ipcRenderer, 'invoke'], 'db-find-one', TableName.CheckData, { serial: payload.serial });
                const [, timestamp] = data.mobileName!.split('_');
                let next: FetchData = { ...data };
                next.mobileHolder = payload.mobileHolder;
                next.credential = payload.credential;
                next.mobileName = `${payload.mobileName}_${timestamp}`;
                next.note = payload.note;
                next.mobileNo = payload.mobileNo;
                yield call([ipcRenderer, 'invoke'], 'db-update', TableName.CheckData, { serial: payload.serial }, next);
                yield put({ type: 'setEditEnitity', payload: null });
                yield put({ type: 'queryCheckData', payload: { condition: {}, current: 1 } });
                message.success('保存成功');
            } catch (error) {
                message.destroy();
                message.error('数据保存失败');
                logger.error(`更新点验设备数据失败 @model/settings/CheckManage/updateCheckData ${error.message}`);
            }
        },
        /**
         * 删除数据
         * @param {FetchData} payload FetchData实体
         */
        *delCheckData({ payload }: AnyAction, { call, put }: EffectsCommandMap) {
            try {
                let deleteCount: number = yield call([ipcRenderer, 'invoke'], 'db-remove', TableName.CheckData, { serial: payload.serial });
                if (deleteCount > 0) {
                    message.success('删除成功');
                    yield put({ type: 'queryCheckData', payload: { condition: {}, current: 1 } });
                }
            } catch (error) {
                message.destroy();
                message.error('数据查询失败');
                logger.error(`查询点验设备数据失败 @model/settings/CheckManage/queryBySerial ${error.message}`);
            }
        },
        /**
         * 删除全部数据
         * @param {FetchData} payload FetchData实体
         */
        *clearCheckData({ payload }: AnyAction, { call, put }: EffectsCommandMap) {
            try {
                let deleteCount: number = yield call([ipcRenderer, 'invoke'], 'db-remove', TableName.CheckData, {}, true);
                if (deleteCount > 0) {
                    message.success('删除成功');
                    yield put({ type: 'queryCheckData', payload: { condition: {}, current: 1 } });
                }
            } catch (error) {
                message.destroy();
                message.error('数据查询失败');
                logger.error(`查询点验设备数据失败 @model/settings/CheckManage/queryBySerial ${error.message}`);
            }
        }
    }
};

export { CheckManageModelState };
export default model;