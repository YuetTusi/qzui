
import { Model, EffectsCommandMap } from "dva";
import { AnyAction } from 'redux';
import Modal from 'antd/lib/modal';
import Db from '@utils/db';
import CCaseInfo from "@src/schema/CCaseInfo";
import { helper } from '@src/utils/helper';
import { TableName } from "@src/schema/db/TableName";
import logger from "@src/utils/log";
import DeviceType from "@src/schema/socket/DeviceType";

const PAGE_SIZE = 10;

/**
 * 仓库Model
 */
interface StoreModel {
    /**
     * 总记录数
     */
    total: number;
    /**
     * 当前页
     */
    current: number;
    /**
     * 页尺寸
     */
    pageSize: number;
    /**
     * 案件数据
     */
    caseData: any[];
    /**
     * 加载中
     */
    loading: boolean;
}

/**
 * 案件信息Model
 */
let model: Model = {
    namespace: 'parse',
    state: {
        //案件表格数据
        caseData: [],
        total: 0,
        current: 1,
        pageSize: PAGE_SIZE,
        loading: false
    },
    reducers: {
        setCaseData(state: any, { payload }: AnyAction) {
            state.caseData = payload;
            return state;
        },
        setPage(state: any, { payload }: AnyAction) {
            state.total = payload.total;
            state.current = payload.current;
            state.pageSize = payload.pageSize;
            return state;
        },
        setLoading(state: any, { payload }: AnyAction) {
            state.loading = payload;
            return state;
        }
    },
    effects: {
        /**
         * 查询案件列表
         */
        *fetchCaseData({ payload }: AnyAction, { all, call, put }: EffectsCommandMap) {
            const db = new Db<CCaseInfo>(TableName.Case);
            const { current, pageSize = PAGE_SIZE } = payload;
            yield put({ type: 'setLoading', payload: true });
            try {
                const [result, total]: [CCaseInfo[], number] = yield all([
                    call([db, 'findByPage'], null, current, pageSize, 'createdAt', -1),
                    call([db, 'count'], null)
                ]);
                yield put({ type: 'setCaseData', payload: result });
                yield put({ type: 'setPage', payload: { current, pageSize, total } });
            } catch (error) {
                console.log(`@modal/CaseData.ts/fetchCaseData: ${error.message}`);
            } finally {
                yield put({ type: 'setLoading', payload: false });
            }
        },
        /**
         * 更新数据库解析状态
         * @param {string} payload.id 设备id
         * @param {string} payload.caseId 案件id
         * @param {ParseState} payload.parseState 解析状态
         */
        *updateParseState({ payload }: AnyAction, { call, put }: EffectsCommandMap) {
            const { id, caseId, parseState } = payload;
            const db = new Db<DeviceType>(TableName.Device);
            try {
                yield call([db, 'update'], { id }, { $set: { parseState } });
                yield put({ type: "fetchCaseData", payload: { current: 1 } });

                logger.error(`解析状态更新，id:${id}，状态:${parseState}`);
                console.log(`解析状态更新，id:${id}，状态:${parseState}`);
            } catch (error) {
                logger.error(`更新解析状态入库失败 @model/record/Display/updateParseState: ${error.message}`);
            }
        },
        /**
         * 删除案件数据
         * @param {string} payload.id 案件id
         * @param {string} payload.casePath 案件路径
         */
        *deleteCaseData({ payload }: AnyAction, { call, put }: EffectsCommandMap) {
            const { id, casePath } = payload;
            const db = new Db<CCaseInfo>(TableName.Case);
            const modal = Modal.info({
                content: '正在删除，请不要关闭程序',
                okText: '确定',
                maskClosable: false,
                okButtonProps: { disabled: true, icon: 'loading' }
            });
            try {
                let success = yield helper.delDiskFile(casePath);
                if (success) {
                    //NOTE:磁盘文件删除成功后，删除数据库记录
                    yield call([db, 'remove'], { _id: id });
                    yield put({ type: 'fetchCaseData', payload: { current: 1, pageSize: PAGE_SIZE } });
                    modal.update({ content: '删除成功', okButtonProps: { disabled: false, icon: 'check-circle' } });
                } else {
                    modal.update({ content: '删除失败', okButtonProps: { disabled: false, icon: 'check-circle' } });
                }
                setTimeout(() => {
                    modal.destroy();
                }, 1500);
            } catch (error) {
                modal.update({ content: '删除失败', okButtonProps: { disabled: false, icon: 'check-circle' } });
                setTimeout(() => {
                    modal.destroy();
                }, 1500);
            } finally {
                yield put({ type: 'setLoading', payload: false });
            }
        },
        /**
         * 删除手机数据
         * @param {string} payload.caseId 案件id
         * @param {DeviceType} payload.data 设备对象
         */
        *deleteDevice({ payload }: AnyAction, { call, put }: EffectsCommandMap) {

            const db = new Db<CCaseInfo>(TableName.Case);
            const modal = Modal.info({
                content: '正在删除，请不要关闭程序',
                okText: '确定',
                maskClosable: false,
                okButtonProps: { disabled: true, icon: 'loading' }
            });
            try {
                yield put({ type: 'setLoading', payload: true });
                let caseData: CCaseInfo = yield call([db, 'findOne'], { _id: payload.caseId });

                let deviceData = caseData.devices.find(i => i.id === payload.data.id);
                if (deviceData === undefined) {
                    modal.update({ content: '删除失败' });
                    setTimeout(() => {
                        modal.destroy();
                    }, 1000);
                } else {
                    let success = yield helper.delDiskFile(deviceData.phonePath!);
                    if (success) {
                        //NOTE:磁盘文件删除成功后，更新数据库
                        let updatedDevices = caseData.devices.filter(item => item.id !== payload.data.id);
                        caseData.devices = updatedDevices;
                        yield call([db, 'update'], { _id: payload.caseId }, caseData);
                        yield put({ type: 'fetchCaseData', payload: { current: 1, pageSize: PAGE_SIZE } });
                        modal.update({ content: '删除成功', okButtonProps: { disabled: false, icon: 'check-circle' } });
                    } else {
                        modal.update({ content: '删除失败', okButtonProps: { disabled: false, icon: 'check-circle' } });
                    }
                    setTimeout(() => {
                        modal.destroy();
                    }, 1000);
                }

            } catch (error) {
                console.log(`@modal/record/Display/Parse/deleteDevice: ${error.message}`);
                modal.update({ content: '删除失败', okButtonProps: { disabled: false, icon: 'check-circle' } });
                setTimeout(() => {
                    modal.destroy();
                }, 1000);
            } finally {
                yield put({ type: 'setLoading', payload: false });
            }
        }
    }
};

export { StoreModel };
export default model;