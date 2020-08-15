import path from 'path';
import { remote } from 'electron';
import { Model, EffectsCommandMap } from "dva";
import { AnyAction } from 'redux';
import Modal from 'antd/lib/modal';
import Db from '@utils/db';
import CCaseInfo from "@src/schema/CCaseInfo";
import { helper } from '@src/utils/helper';
import { TableName } from "@src/schema/db/TableName";
import logger from "@src/utils/log";

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
            const db = new Db<CCaseInfo>(TableName.Case);
            let mobileName: string | undefined;
            try {
                let caseData: CCaseInfo = yield call([db, 'findOne'], { _id: caseId });
                caseData.devices = caseData.devices.map(item => {
                    if (item.id === id) {
                        item.parseState = parseState;
                        mobileName = item.mobileName;
                    }
                    return item;
                });
                yield call([db, 'update'], { _id: caseId }, caseData);
                yield put({ type: "fetchCaseData", payload: { current: 1 } });
                // if (mobileName) {
                //     ipcRenderer.send('show-notice', {
                //         message: `「${mobileName.split('_')[0]}」解析完成`
                //     });
                // }
                logger.error(`解析状态更新：${mobileName}:${parseState}`);
                console.log(`解析状态更新：${mobileName}:${parseState}`);
                mobileName = undefined;
            } catch (error) {
                logger.error(`更新解析状态入库失败 @model/record/Display/updateParseState: ${error.message}`);
            }
        },
        /**
         * 生成报告
         * @param {string} payload 设备路径
         */
        *createReport({ payload }: AnyAction, { call }: EffectsCommandMap) {
            const db = new Db<CCaseInfo>(TableName.Case);
            const createReportPath = path.join(remote.app.getAppPath(),
                '../../../tools/CreateReport/CreateReport.exe');

            try {
                let caseData: CCaseInfo = yield call([db, 'findOne'], { _id: payload.caseId });
                let device = caseData.devices.find(i => i.id === payload.deviceId);
                if (!helper.isNullOrUndefined(device)) {
                    console.log(createReportPath);
                    console.log(device?.phonePath);
                    helper.runExe(createReportPath, [path.join(device?.phonePath!, 'out')]).catch(err => {
                        console.log(`生成报告失败:${err}`);
                        logger.error(`生成报告失败 @model/dashboard/Device/effects/createReport: ${err}`);
                    }).finally(() => {
                        console.log('CreateReport finally...');
                    });
                }
            } catch (error) {
                console.log(`查询案件数据失败:${error.message}`);
                logger.error(`查询案件数据失败 @model/dashboard/Device/effects/createReport: ${error.message}`);
            }
        },
        /**
         * 删除手机数据
         * @param {string} payload.caseId 案件id
         * @param {DeviceType} payload.data 设备对象
         */
        *deleteDevice({ payload }: AnyAction, { call, put }: EffectsCommandMap) {
            // alert(1);
            // console.clear();
            // console.log(payload);
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
                        modal.update({ content: '删除成功', okButtonProps: { disabled: false, icon: 'check-circle' } });
                        //NOTE:磁盘文件删除成功后，更新数据库
                        let updatedDevices = caseData.devices.filter(item => item.id !== payload.data.id);
                        caseData.devices = updatedDevices;
                        yield call([db, 'update'], { _id: payload.caseId }, caseData);
                        yield put({ type: 'fetchCaseData', payload: { current: 1, pageSize: PAGE_SIZE } });
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