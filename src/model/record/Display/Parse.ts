import { AnyAction } from 'redux';
import { Model, EffectsCommandMap } from "dva";
import Modal from 'antd/lib/modal';
import Db from '@utils/db';
import logger from "@utils/log";
import { helper } from '@utils/helper';
import CCaseInfo from "@src/schema/CCaseInfo";
import { TableName } from "@src/schema/db/TableName";
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
 * 解析列表Model
 */
let model: Model = {
    namespace: 'parse',
    state: {
        caseData: [],
        total: 0,
        current: 1,
        pageSize: PAGE_SIZE,
        loading: false
    },
    reducers: {
        /**
         * 更新案件数据
         * @param {CCaseInfo[]} payload 案件数据
         */
        setCaseData(state: any, { payload }: AnyAction) {
            state.caseData = payload;
            return state;
        },
        /**
         * 更新分页数据
         * @param {number} payload.total 记录总数
         * @param {number} payload.current 当前页
         * @param {number} payload.pageSize 页尺寸
         */
        setPage(state: any, { payload }: AnyAction) {
            state.total = payload.total;
            state.current = payload.current;
            state.pageSize = payload.pageSize;
            return state;
        },
        /**
         * 设置加载状态
         * @param {boolean} payload 是否加载中
         */
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
         * @param {ParseState} payload.parseState 解析状态
         */
        *updateParseState({ payload }: AnyAction, { call, put }: EffectsCommandMap) {
            const { id, parseState } = payload;
            const db = new Db<DeviceType>(TableName.Device);
            try {
                yield call([db, 'update'], { id }, { $set: { parseState } });
                yield put({ type: "fetchCaseData", payload: { current: 1 } });

                logger.info(`解析状态更新, deviceId:${id}, 状态:${parseState}`);
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
        *deleteCaseData({ payload }: AnyAction, { all, call, fork, put }: EffectsCommandMap) {
            const { id, casePath } = payload;
            const caseDb = new Db<CCaseInfo>(TableName.Case);
            const deviceDb = new Db<DeviceType>(TableName.Device);
            const checkDb = new Db<DeviceType>(TableName.CheckData);

            const modal = Modal.info({
                content: '正在删除，请不要关闭程序',
                okText: '确定',
                maskClosable: false,
                okButtonProps: { disabled: true, icon: 'loading' }
            });
            try {
                let success = yield helper.delDiskFile(casePath);
                let devicesInCase: DeviceType[] = yield call([deviceDb, 'find'], { caseId: payload.id });
                if (success) {
                    //NOTE:磁盘文件删除成功后，删除数据库记录
                    yield all([
                        call([deviceDb, 'remove'], { caseId: payload.id }, true),
                        call([caseDb, 'remove'], { _id: id })
                    ]);
                    yield put({ type: 'fetchCaseData', payload: { current: 1, pageSize: PAGE_SIZE } });
                    if (devicesInCase.length !== 0) {
                        //删除掉点验记录中对应的设备
                        yield fork([checkDb, 'remove'], { serial: { $in: devicesInCase.map(i => i.serial) } }, true);
                    }
                    modal.update({ content: '删除成功', okButtonProps: { disabled: false, icon: 'check-circle' } });
                } else {
                    modal.update({ title: '删除失败', content: '可能文件仍被占用，请稍后再试', okButtonProps: { disabled: false, icon: 'check-circle' } });
                }
                setTimeout(() => {
                    modal.destroy();
                }, 1500);
            } catch (error) {
                modal.update({ title: '删除失败', content: '可能文件仍被占用，请稍后再试', okButtonProps: { disabled: false, icon: 'check-circle' } });
                setTimeout(() => {
                    modal.destroy();
                }, 1500);
            } finally {
                yield put({ type: 'setLoading', payload: false });
            }
        }
    }
};

export { StoreModel };
export default model;