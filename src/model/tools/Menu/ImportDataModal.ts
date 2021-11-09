import { mkdirSync } from 'fs';
import path from 'path';
import { AnyAction } from 'redux';
import { ipcRenderer } from 'electron';
import { Model, EffectsCommandMap } from 'dva';
import { DataMode } from '@src/schema/DataMode';
import { CCaseInfo } from '@src/schema/CCaseInfo';
import { TableName } from '@src/schema/db/TableName';
import DeviceType from '@src/schema/socket/DeviceType';
import CommandType, { SocketType } from '@src/schema/socket/Command';
import logger from '@utils/log';
import log from '@utils/log';
import { helper } from '@src/utils/helper';
import { LocalStoreKey } from '@src/utils/localStore';
import { send } from '@src/service/tcpServer';

interface StoreData {
    /**
     * 案件列表
     */
    caseList: CCaseInfo[]
}

/**
 * 导入数据输入框
 */
let model: Model = {
    namespace: 'importDataModal',
    state: {
        caseList: []
    },
    reducers: {
        setCaseList(state: any, action: AnyAction) {
            return { ...state, caseList: [...action.payload] };
        }
    },
    effects: {
        /**
         * 查询案件下拉列表数据
         */
        *queryCaseList(action: AnyAction, { call, put }: EffectsCommandMap) {
            try {
                let list: CCaseInfo[] = yield call([ipcRenderer, 'invoke'], 'db-find', TableName.Case, {}, 'updatedAt', -1);
                yield put({ type: 'setCaseList', payload: list });
            } catch (error) {
                console.log(`@model/tools/Menu/ImportDataModal.ts/queryCaseList:${error.message}`);
                logger.error({ message: `@model/tools/Menu/ImportDataModal.ts/queryCaseList: ${error.stack}` });
            }
        },
        /**
         * 将第三方导入的手机数据入库到案件下
         * @param {DeviceType} payload.device 设备数据
         * @param {string} payload.packagePath 第三方数据路径
         * @param {string} payload.sdCardPath SD卡数据路径（只安卓数据导入使用）
         * @param {ImportType} payload.dataType 数据类型
         */
        *saveImportDeviceToCase({ payload }: AnyAction, { all, call, fork }: EffectsCommandMap) {

            const device = payload.device as DeviceType;
            const useKeyword = localStorage.getItem(LocalStoreKey.UseKeyword) === '1';

            let exist = yield helper.existFile(device.phonePath!);
            if (!exist) {
                //手机路径不存在，创建之
                mkdirSync(device.phonePath!, { recursive: true });
            }
            //将设备信息写入Device.json
            yield fork([helper, 'writeJSONfile'], path.join(device.phonePath!, 'Device.json'), {
                mobileHolder: device.mobileHolder ?? '',
                mobileNo: device.mobileNo ?? '',
                mobileName: device.mobileName ?? '',
                note: device.note ?? '',
                mode: DataMode.Self
            });

            try {
                const [, caseData]: [CCaseInfo, CCaseInfo | null] = yield all([
                    call([ipcRenderer, 'invoke'], 'db-insert', TableName.Device, {
                        _id: device._id,
                        id: device.id,
                        caseId: device.caseId,
                        checker: device.checker,
                        checkerNo: device.checkerNo,
                        fetchState: device.fetchState,
                        parseState: device.parseState,
                        fetchTime: device.fetchTime,
                        fetchType: device.fetchType,
                        manufacturer: device.manufacturer,
                        mobileHolder: device.mobileHolder,
                        mobileName: device.mobileName,
                        mobileNo: device.mobileNo,
                        mobileNumber: device.mobileNumber,
                        mode: device.mode ?? DataMode.Self,
                        model: device.model,
                        note: device.note,
                        parseTime: device.parseTime,
                        phonePath: device.phonePath,
                        serial: device.serial,
                        system: device.system
                    }),
                    call([ipcRenderer, 'invoke'], 'db-find-one', TableName.Case, { _id: device.caseId })
                ]);

                //#通知Parse开始导入
                yield fork(send, SocketType.Parse, {
                    type: SocketType.Parse,
                    cmd: CommandType.ImportDevice,
                    msg: {
                        caseId: device.caseId,
                        deviceId: device.id,
                        phonePath: device.phonePath,
                        packagePath: payload.packagePath,
                        sdCardPath: payload.sdCardPath ?? '',
                        dataType: payload.dataType,
                        mobileName: device.mobileName,
                        mobileHolder: device.mobileHolder,
                        model: device.mobileName,
                        mobileNo: [device.mobileNo ?? ''], //此字段意义换为IMEI
                        note: device.note ?? '',
                        hasReport: caseData?.hasReport ?? false,
                        useKeyword
                    }
                });

                log.info(`开始第三方数据导入,参数：${JSON.stringify({
                    type: SocketType.Parse,
                    cmd: CommandType.ImportDevice,
                    msg: {
                        caseId: device.caseId,
                        deviceId: device.id,
                        phonePath: device.phonePath,
                        packagePath: payload.packagePath,
                        sdCardPath: payload.sdCardPath ?? '',
                        dataType: payload.dataType,
                        mobileName: device.mobileName,
                        mobileHolder: device.mobileHolder,
                        mobileNo: device.mobileNo,
                        note: device.note ?? '',
                        hasReport: caseData?.hasReport ?? false,
                        useKeyword
                    }
                })}`);
            } catch (error) {
                logger.error(`设备数据入库失败 @model/tools/Menu/ImportDataModal/saveImportDeviceToCase: ${error.message}`);
            }
        }
    }
};

export { StoreData };
export default model;