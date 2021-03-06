
import { remote } from 'electron';
import { Model, EffectsCommandMap } from "dva";
import { AnyAction } from 'redux';
import Modal from 'antd/lib/modal';
// import Db from '@utils/db';
import { helper } from '@src/utils/helper';
import CCaseInfo from "@src/schema/CCaseInfo";
import { TableName } from "@src/schema/db/TableName";
import DeviceType from "@src/schema/socket/DeviceType";
import { BcpHistory } from '@src/schema/socket/BcpHistory';
import { DbInstance } from '@src/type/model';

const getDb = remote.getGlobal('getDb');
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
    namespace: 'caseData',
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
            const db: DbInstance<CCaseInfo> = getDb(TableName.Case);
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
         * 删除案件记录(payload为NeDB_id)
         * @param {string} payload.id 案件id
         * @param {string} payload.casePath 案件路径
         */
        *deleteCaseData({ payload }: AnyAction, { all, call, put }: EffectsCommandMap) {
            const caseDb: DbInstance<CCaseInfo> = getDb(TableName.Case);
            const deviceDb: DbInstance<DeviceType> = getDb(TableName.Device);
            const checkDb: DbInstance<DeviceType> = getDb(TableName.CheckData);
            const bcpHistoryDb: DbInstance<BcpHistory> = getDb(TableName.CreateBcpHistory);

            const modal = Modal.info({
                content: '正在删除，可能时间较长，请不要关闭程序',
                okText: '确定',
                maskClosable: false,
                okButtonProps: { disabled: true, icon: 'loading' }
            });
            try {
                yield put({ type: 'setLoading', payload: true });
                let success: boolean = yield helper.delDiskFile(payload.casePath);
                if (success) {
                    //# 磁盘文件成功删除后，删掉数据库相关记录
                    let devicesInCase: DeviceType[] = yield call([deviceDb, 'find'], { caseId: payload.id });
                    yield all([
                        call([deviceDb, 'remove'], { caseId: payload.id }, true),
                        call([caseDb, 'remove'], { _id: payload.id })
                    ]);
                    if (devicesInCase.length !== 0) {
                        //删除掉点验记录 和 BCP历史记录
                        yield all([
                            call([checkDb, 'remove'], { serial: { $in: devicesInCase.map(i => i.serial) } }, true),
                            call([bcpHistoryDb, 'remove'], { deviceId: { $in: devicesInCase.map(i => i.id) } }, true)
                        ]);
                    }
                    modal.update({ content: '删除成功', okButtonProps: { disabled: false, icon: 'check-circle' } });
                } else {
                    modal.update({ title: '删除失败', content: '可能文件仍被占用，请稍后再试', okButtonProps: { disabled: false, icon: 'check-circle' } });
                }
                setTimeout(() => {
                    modal.destroy();
                }, 1000);
            } catch (error) {
                console.log(`@modal/CaseData.ts/deleteCaseData: ${error.message}`);
                modal.update({ title: '删除失败', content: '可能文件仍被占用，请稍后再试', okButtonProps: { disabled: false, icon: 'check-circle' } });
                setTimeout(() => {
                    modal.destroy();
                }, 1000);
            } finally {
                yield put({
                    type: 'fetchCaseData', payload: {
                        current: 1,
                        pageSize: PAGE_SIZE
                    }
                });
            }
        }
    }
};

export { StoreModel };
export default model;