import { mkdirSync } from 'fs';
import path from 'path';
import { AnyAction } from 'redux';
import { ipcRenderer } from 'electron';
import { Model, EffectsCommandMap } from 'dva';
import { DataMode } from '@src/schema/DataMode';
import { CaseType, CCaseInfo } from '@src/schema/CCaseInfo';
import { TableName } from '@src/schema/db/TableName';
import DeviceType from '@src/schema/socket/DeviceType';
import CommandType, { SocketType } from '@src/schema/socket/Command';
import log from '@utils/log';
import { helper } from '@src/utils/helper';
import { LocalStoreKey } from '@src/utils/localStore';
import { send } from '@src/service/tcpServer';
import { PredictJson } from '@src/view/case/AISwitch/prop';

interface StoreData {
    /**
     * 案件列表
     */
    caseList: CCaseInfo[],
    /**
     * 提示信息
     */
    tips: string[] | JSX.Element[]
}

/**
 * 导入数据输入框
 */
let model: Model = {
    namespace: 'importDataModal',
    state: {
        caseList: [],
        tips: []
    },
    reducers: {
        setCaseList(state: any, action: AnyAction) {
            return { ...state, caseList: [...action.payload] };
        },
        setTips(state: any, { payload }: AnyAction) {
            return { ...state, tips: payload };
        }
    },
    effects: {
        /**
         * 查询案件下拉列表数据
         */
        *queryCaseList(action: AnyAction, { call, put }: EffectsCommandMap) {
            try {
                let list: CCaseInfo[] = yield call(
                    [ipcRenderer, 'invoke'],
                    'db-find',
                    TableName.Case,
                    {
                        $not: { caseType: CaseType.QuickCheck }
                    },
                    'updatedAt',
                    -1
                );
                yield put({ type: 'setCaseList', payload: list });
            } catch (error) {
                console.log(`@model/tools/Menu/ImportDataModal.ts/queryCaseList:${error.message}`);
                log.error({ message: `@model/tools/Menu/ImportDataModal.ts/queryCaseList: ${error.stack}` });
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
            const useDefaultTemp = localStorage.getItem(LocalStoreKey.UseDefaultTemp) === '1';
            const useKeyword = localStorage.getItem(LocalStoreKey.UseKeyword) === '1';
            const useDocVerify = localStorage.getItem(LocalStoreKey.UseDocVerify) === '1';
            const usePdfOcr = localStorage.getItem(LocalStoreKey.UsePdfOcr) === '1';
            const tempAt = helper.IS_DEV
                ? path.join(helper.CWD, './data/predict.json')
                : path.join(helper.CWD, './resources/config/predict.json'); //模版路径

            let exist: boolean = yield helper.existFile(device.phonePath!);
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

            let aiConfig: PredictJson = { config: [], similarity: 0, ocr: false };
            const predictAt = path.join(device.phonePath!, '../../', 'predict.json');
            const hasPredict: boolean = yield call([helper, 'existFile'], predictAt);
            if (hasPredict) {
                //案件下存在predict.json
                aiConfig = yield call([helper, 'readJSONFile'], predictAt);
            } else {
                const aiTemp: PredictJson = yield call([helper, 'readJSONFile'], tempAt);
                aiConfig = helper.combinePredict(aiTemp, aiConfig);
            }

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
                        useAiOcr: !caseData?.isPhotoAnalysis,
                        isPhotoAnalysis: caseData?.isPhotoAnalysis ?? false,
                        aiTypes: aiConfig,
                        useDefaultTemp,
                        useKeyword,
                        useDocVerify: [useDocVerify, usePdfOcr]
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
                        useDefaultTemp,
                        useKeyword,
                        aiTypes: aiConfig,
                        useDocVerify: [useDocVerify, usePdfOcr]
                    }
                })}`);
            } catch (error) {
                log.error(`设备数据入库失败 @model/tools/Menu/ImportDataModal/saveImportDeviceToCase: ${error.message}`);
            }
        }
    }
};

export { StoreData };
export default model;