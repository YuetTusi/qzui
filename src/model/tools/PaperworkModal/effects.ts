import { groupBy } from 'lodash';
import { EffectsCommandMap } from 'dva';
import { AnyAction } from 'redux';
import { AntTreeNodeProps } from 'antd/lib/tree';
import { TableName } from '@src/schema/db/TableName';
import { DeviceType } from '@src/schema/socket/DeviceType';
import { CCaseInfo } from '@src/schema/CCaseInfo';
import { helper } from '@src/utils/helper';
import { ipcRenderer } from 'electron';
import logger from '@src/utils/log';


export default {

    *queryCaseTree({ }: AnyAction, { all, put, call }: EffectsCommandMap) {

        yield put({ type: 'setLoading', payload: true });

        try {
            const [caseData, deviceData]: [CCaseInfo[], DeviceType[]] = yield all([
                call([ipcRenderer, 'invoke'], 'db-find', TableName.Case, null, 'createdAt', -1),
                call([ipcRenderer, 'invoke'], 'db-find', TableName.Device, null, 'createdAt', -1)
            ]);

            const nodes = caseData.reduce<AntTreeNodeProps[]>((acc, current) => {

                //按持有人分组
                const holder = groupBy(deviceData.filter(i => i.caseId === current._id), 'mobileHolder');
                // const caseName = helper.getNameWithoutTime(current.m_strCaseName);
                acc.push({
                    key: current._id,
                    // title: caseName,
                    disabled: false,
                    isLeaf: false,
                    checkable: false,
                    selectable: false,
                    children: Object.keys(holder).map<any>((i, index) => ({
                        key: `holder_${helper.newId()}`,
                        title: i,
                        disabled: false,
                        isLeaf: holder[i].length === 0,
                        checkable: true,
                        selectable: false,
                        caseId: current._id,
                        // caseName: caseName,
                        children: holder[i].map(j => ({
                            key: j._id,
                            // title: helper.getNameWithoutTime(j.mobileName!),
                            disabled: false,
                            isLeaf: true,
                            checkable: true,
                            selectable: false,
                            _id: j._id,
                            caseId: current._id,
                            // caseName: caseName,
                            mobileHolder: j.mobileHolder,
                            mobileName: j.mobileName,
                            mobileNumber: j.mobileNumber,
                            model: j.model,
                            serial: j.serial
                        }))
                    }))
                });
                return acc;
            }, []);

            yield put({
                type: 'setExpandedKeys',
                payload: ['case_tree_root', ...caseData.map(i => i._id)]
            });

            yield put({
                type: 'setCaseTree', payload: [{
                    key: 'case_tree_root',
                    title: '案件',
                    disabled: false,
                    isLeaf: false,
                    checkable: false,
                    children: nodes
                }]
            });

        } catch (error) {
            logger.error(`查询案件树失败 @modal/tools/PaperworkModal/*queryCaseTree: ${error.message}`);
        } finally {
            yield put({ type: 'setLoading', payload: false });
        }
    },
    *queryCaseName({ payload }: AnyAction, { call, put }: EffectsCommandMap) {
        try {
            const data: CCaseInfo | null = call([ipcRenderer, 'invoke'], 'db-find-one', TableName.Case, { _id: payload });
            if (data !== null) {
                // const name = helper.getNameWithoutTime(data.m_strCaseName);
                // yield put({ type: 'setSelectedCaseName', payload: name });
            }
        } catch (error) {
            logger.error(`查询案件名称失败 @modal/tools/PaperworkModal/*queryCaseName: ${error.message}`);
        }
    }
}