import { ipcRenderer, remote } from 'electron';
import { AnyAction } from 'redux';
import { EffectsCommandMap } from 'dva';
import Modal from 'antd/lib/modal';
import { LocalStoreKey } from '@utils/localStore';
import { helper } from '@utils/helper';
import logger from '@utils/log';
import { DbInstance } from '@src/type/model';
import { TableName } from '@src/schema/db/TableName';
import { DeviceType } from '@src/schema/socket/DeviceType';
import { ParseState } from '@src/schema/socket/DeviceState';
import Manufaturer from '@src/schema/socket/Manufaturer';

const getDb = remote.getGlobal('getDb');

export default {
    /**
     * 退出前检测采集&解析状态
     */
    *fetchingAndParsingState({ payload }: AnyAction, { call }: EffectsCommandMap) {

        const manu: Manufaturer = yield call([helper, 'readManufaturer']);

        let question = `确认退出「${manu.materials_name}」？`;
        Modal.destroyAll();
        Modal.confirm({
            title: '退出',
            content: question,
            okText: '是',
            cancelText: '否',
            zIndex: 9000,
            onOk() {
                localStorage.removeItem(LocalStoreKey.CaseData);
                ipcRenderer.send('do-close', true);
            }
        });
    },
    /**
     * 将案件下所有设备为`解析中`和`采集中`更新为新状态
     * @param {ParseState} payload 解析状态
     */
    *updateAllDeviceParseState({ payload }: AnyAction, { call, fork }: EffectsCommandMap) {
        const db: DbInstance<DeviceType> = getDb(TableName.Device);
        let msgBox: any = null;
        try {
            let data: DeviceType[] = yield call([db, 'all']);
            let updateId: string[] = [];
            for (let i = 0; i < data.length; i++) {
                if (data[i].parseState === ParseState.Fetching || data[i].parseState === ParseState.Parsing) {
                    updateId.push(data[i]._id!);
                }
            }
            if (updateId.length > 0) {
                msgBox = Modal.info({
                    content: '正在处理数据，请稍候...',
                    okText: '确定',
                    maskClosable: false,
                    okButtonProps: { disabled: true, icon: 'loading' }
                });
                yield fork([db, 'update'], { _id: { $in: updateId } }, { $set: { parseState: payload } }, true);
            }
        } catch (error) {
            logger.error(`启动应用更新解析状态失败 @modal/dashboard/index.ts/updateAllDeviceParseState: ${error.message}`);
        } finally {
            if (msgBox !== null) {
                msgBox.destroy();
            }
        }
    }
};