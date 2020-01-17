import { exec, ExecException } from 'child_process';
import { helper } from '@utils/helper';
import { AnyAction } from 'redux';
import { Model, EffectsCommandMap, SubscriptionAPI } from 'dva';
import Rpc from '@src/service/rpc';

/**
 * 磁盘数据
 */
interface DiskInfoData {
    /**
     * 剩余空间
     */
    FreeSpace: number;
    /**
     * 总容量
     */
    Size: number;
}

interface StoreState {
    /**
     * 仓库State
     */
    disk: string;
    /**
     * 剩余空间(byte)
     */
    freeSpace: number;
    /**
     * 总容量(byte)
     */
    size: number;
}

let model: Model = {
    namespace: 'dashboard',
    state: {
        disk: 'C:',
        freeSpace: 0,
        size: 0
    },
    reducers: {
        setDisk(state: any, { payload }: AnyAction) {
            return {
                ...state,
                disk: payload
            };
        },
        setSize(state: any, { payload }: AnyAction) {
            return {
                ...state,
                freeSpace: Number.parseInt(payload.freeSpace),
                size: Number.parseInt(payload.size)
            };
        }
    },
    effects: {
        /**
         * 更新磁盘信息
         */
        *updateDiskInfo({ payload }: AnyAction, { call, put }: EffectsCommandMap) {
            let rpc = new Rpc();
            let data: DiskInfoData;
            try {
                let path = yield call([rpc, 'invoke'], 'GetDataSavePath', []);
                if (path && path.length > 0) {
                    data = yield call(getDiskInfo, path.substring(0, 2));
                } else {
                    data = yield call(getDiskInfo, 'C:');
                }
                yield put({
                    type: 'setSize', payload: {
                        freeSpace: data!.FreeSpace,
                        size: data!.Size
                    }
                });
            } catch (error) {
                console.log(error.message);
            }
        }
    },
    subscriptions: {
        readDiskInfo({ dispatch }: SubscriptionAPI) {
            let rpc = new Rpc();
            rpc.invoke<string>('GetDataSavePath', []).then(path => {
                if (path && path.length > 0) {
                    let diskCharactor = path.substring(0, 2);
                    dispatch({ type: 'setDisk', payload: diskCharactor });
                    return getDiskInfo(diskCharactor);
                } else {
                    return getDiskInfo('C:');
                }
            }).then((data: DiskInfoData) => {
                dispatch({
                    type: 'setSize', payload: {
                        freeSpace: data.FreeSpace,
                        size: data.Size
                    }
                });
            }).catch((err: Error) => {
                console.log(err.message);
            });
        }
    }
}

/**
 * 取磁盘容量信息
 * @param diskName 盘符
 */
function getDiskInfo(diskName: string = 'C:'): Promise<DiskInfoData> {

    const command = `wmic logicalDisk where "Caption='${diskName}'" get FreeSpace,Size /value`;

    return new Promise((resolve, reject) => {
        exec(command, (err: ExecException | null, stdout: string) => {
            if (err) {
                reject(err);
            } else {
                let cmdResults = stdout.trim().split('\r\r\n');
                let result = cmdResults.reduce<DiskInfoData>((total, current) => {
                    return Object.assign(total, helper.keyValue2Obj(current));
                }, {} as DiskInfoData);
                resolve(result);
            }
        });
    });
}

export { StoreState };
export default model;