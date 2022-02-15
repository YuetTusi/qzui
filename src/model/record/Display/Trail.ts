import { join } from 'path';
import { readdir } from 'fs/promises';
import { ipcRenderer } from 'electron';
import { AnyAction } from 'redux';
import { Model, EffectsCommandMap } from 'dva';
import log from '@utils/log';
import { helper } from '@utils/helper';
import { DeviceType } from '@src/schema/socket/DeviceType';
import { TableName } from '@src/schema/db/TableName';
import { CCaseInfo } from '@src/schema/CCaseInfo';
import { InstallApp } from '@src/schema/InstallApp';
import { StateTree } from '@src/type/model';

interface TrailStoreState {

    /**
     * 案件
     */
    caseData: CCaseInfo | null,
    /**
     * 设备
     */
    deviceData: DeviceType | null,
    /**
     * 应用数据
     */
    installData: InstallApp | null,
    /**
     * 读取中
     */
    loading: boolean
}

const model: Model = {

    namespace: 'trail',
    state: {
        caseData: null,
        deviceData: null,
        installData: null,
        loading: false
    },
    reducers: {
        setCaseData(state: TrailStoreState, { payload }: AnyAction) {
            state.caseData = payload;
            return state;
        },
        setDeviceData(state: TrailStoreState, { payload }: AnyAction) {
            state.deviceData = payload;
            return state;
        },
        setInstallData(state: TrailStoreState, { payload }: AnyAction) {
            state.installData = payload;
            return state;
        },
        setLoading(state: TrailStoreState, { payload }: AnyAction) {
            state.loading = payload;
            return state;
        }
    },
    effects: {
        /**
         * 按id查询设备和案件
         * @param {string} payload  设备id
         */
        *queryDeviceAndCaseById({ payload }: AnyAction, { call, put }: EffectsCommandMap) {
            try {
                let deviceData: DeviceType = yield call([ipcRenderer, 'invoke'], 'db-find-one', TableName.Device, { id: payload });
                let caseData: CCaseInfo = yield call([ipcRenderer, 'invoke'], 'db-find-one', TableName.Case, { _id: deviceData.caseId });

                yield put({ type: 'setDeviceData', payload: deviceData });
                yield put({ type: 'setCaseData', payload: caseData });
            } catch (error) {
                log.error(`查询案件设备记录失败 @model/record/Display/Trail/queryDeviceAndCaseById:${error.message}`);
            }
        },
        /**
         * 读取App JSON数据
         * @param {string} payload.value 值(IMEI/OAID)
         */
        *readAppQueryJson({ payload }: AnyAction, { put, select }: EffectsCommandMap) {

            const { value } = payload;
            const { phonePath }: DeviceType = yield select((state: StateTree) => state.trail.deviceData);

            console.log(`查询值：${value}`);
            try {
                const dir: string[] = yield readdir(join(phonePath!, 'AppQuery', value));
                if (dir.length > 0) {
                    console.table(dir);
                    const [target] = dir.sort((m, n) => n.localeCompare(m)); //按文件名倒序，取最近的文件
                    const { data }: { data: InstallApp[] } =
                        yield helper.readJSONFile(join(phonePath!, 'AppQuery', value, target));
                    console.log(data);
                    if (data.length === 0) {
                        yield put({ type: 'setInstallData', payload: null });
                    } else {
                        yield put({ type: 'setInstallData', payload: data[0] });
                    }
                } else {
                    yield put({ type: 'setInstallData', payload: null });
                }
            } catch (error) {
                yield put({ type: 'setInstallData', payload: null });
                log.error(`读取应用查询记录失败(${value}.json) @model/record/Display/Trail/readAppQueryJson:${error.message}`);
            } finally {
                yield put({ type: 'setLoading', payload: false });
            }
        }
    }
};

export { TrailStoreState };
export default model;
