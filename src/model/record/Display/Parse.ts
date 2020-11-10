import { mkdirSync } from 'fs';
import path from 'path';
import { remote } from 'electron';
import { AnyAction } from 'redux';
import { Model, EffectsCommandMap } from "dva";
import Modal from 'antd/lib/modal';
import message from 'antd/lib/message';
// import Db from '@utils/db';
import logger from "@utils/log";
import { helper } from '@utils/helper';
import CCaseInfo from "@src/schema/CCaseInfo";
import { TableName } from "@src/schema/db/TableName";
import DeviceType from "@src/schema/socket/DeviceType";
import { BcpHistory } from '@src/schema/socket/BcpHistory';
import { DbInstance } from '@src/type/model';

const PAGE_SIZE = 10;
const Db = remote.getGlobal('Db');

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
            const db: DbInstance<CCaseInfo> = new Db(TableName.Case);
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
                console.log(`@modal/record/Display/Parse/CaseData.ts/fetchCaseData: ${error.message}`);
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
            const db: DbInstance<DeviceType> = new Db(TableName.Device);
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
            const caseDb: DbInstance<CCaseInfo> = new Db(TableName.Case);
            const deviceDb: DbInstance<DeviceType> = new Db(TableName.Device);
            const checkDb: DbInstance<DeviceType> = new Db(TableName.CheckData);
            const bcpHistoryDb: DbInstance<BcpHistory> = new Db(TableName.CreateBcpHistory);

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
                modal.update({ title: '删除失败', content: '可能文件仍被占用，请稍后再试', okButtonProps: { disabled: false, icon: 'check-circle' } });
                setTimeout(() => {
                    modal.destroy();
                }, 1000);
            } finally {
                yield put({ type: 'setLoading', payload: false });
            }
        },
        /**
         * 更新设备数据
         * @param {DeviceType} payload 
         */
        *updateDevice({ payload }: AnyAction, { call, fork, put, select }: EffectsCommandMap) {
            const db:DbInstance<DeviceType> = new Db(TableName.Device);
            const { current } = yield select((state: any) => state.parse);
            try {
                yield call([db, 'update'], { id: payload.id }, {
                    $set: {
                        mobileHolder: payload.mobileHolder,
                        mobileNo: payload.mobileNo,
                        note: payload.note
                    }
                });
                let exist = yield helper.existFile(payload.phonePath);
                if (!exist) {
                    //手机路径不存在，创建之
                    mkdirSync(payload.phonePath);
                }
                //将设备信息写入Device.json
                yield fork([helper, 'writeJSONfile'], path.join(payload.phonePath, 'Device.json'), {
                    mobileHolder: payload.mobileHolder ?? '',
                    mobileNo: payload.mobileNo ?? '',
                    mobileName: payload.mobileName ?? '',
                    note: payload.note ?? ''
                });
                yield put({ type: 'fetchCaseData', payload: { current: current ?? 1 } });
                message.success('保存成功');
            } catch (error) {
                message.error('保存失败');
                logger.error(`编辑设备数据失败 @model/record/Display/Parse/updateDevice: ${error.message}`);
            } finally {

            }
        }
    }
};

export { StoreModel };
export default model;