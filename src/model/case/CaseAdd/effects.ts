import { mkdirSync } from 'fs';
import path from 'path';
import { ipcRenderer } from 'electron';
import { EffectsCommandMap } from "dva";
import { AnyAction } from 'redux';
import { routerRedux } from "dva/router";
import message from "antd/lib/message";
import logger from '@utils/log';
import { helper } from "@utils/helper";
import UserHistory, { HistoryKeys } from '@utils/userHistory';
import { Officer as OfficerEntity } from '@src/schema/Officer';
import { TableName } from '@src/schema/db/TableName';
import { CCaseInfo } from '@src/schema/CCaseInfo';
import { StateTree } from '@src/type/model';
import { AiSwitchState } from '../AISwitch';

export default {

    /**
     * 保存案件
     * @param {CCaseInfo} payload.entity 案件
     * @param {string} payload.name 
     */
    *saveCase({ payload }: AnyAction, { call, fork, put, select }: EffectsCommandMap) {
        const { entity, name } = payload as { entity: CCaseInfo, name: string | null };
        const casePath = path.join(entity.m_strCasePath, entity.m_strCaseName);
        yield put({ type: 'setSaving', payload: true });
        const aiSwitch: AiSwitchState = yield select((state: StateTree) => state.aiSwitch);
        //#部分表单域记录历史，下次可快速输入
        UserHistory.set(HistoryKeys.HISTORY_UNITNAME, entity.m_strCheckUnitName);

        try {
            yield call([ipcRenderer, 'invoke'], 'db-insert', TableName.Case, entity);
            if (helper.isNullOrUndefined(name)) {
                yield put(routerRedux.push('/case'));
            } else {
                //# 如果是从取证页面跳转过来，name即有值，跳回取证页面
                yield put(routerRedux.push('/'));
            }
            let exist: boolean = yield helper.existFile(casePath);
            if (!exist) {
                //案件路径不存在，创建之
                mkdirSync(casePath);
            }
            yield fork([helper, 'writeCaseJson'], casePath, entity);
            yield fork([helper, 'writeJSONfile'], path.join(casePath, 'predict.json'), {
                config: aiSwitch.data,
                similarity: aiSwitch.similarity,
                ocr: aiSwitch.ocr
            }); //写ai配置JSON
            message.success('保存成功');
        } catch (error) {
            console.error(`@modal/CaseAdd.ts/saveCase: ${error.message}`);
            logger.error(`@modal/CaseAdd.ts/saveCase:${error.message}`);
            message.error('保存失败');
        } finally {
            yield put({ type: 'setSaving', payload: false });
        }
    },
    /**
     * 查询采集人员
     */
    *queryOfficer({ payload }: AnyAction, { call, put }: EffectsCommandMap) {
        try {
            let data: OfficerEntity[] = yield call([ipcRenderer, 'invoke'], 'db-find', TableName.Officer, {});
            yield put({ type: 'setOfficerList', payload: data });
        } catch (error) {
            logger.error(`查询采集人员列表失败 @model/case/CaseAdd/queryOfficer:${error.message}`);
        }
    }
}