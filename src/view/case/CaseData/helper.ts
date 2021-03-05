import path from 'path';
import { remote } from 'electron';
import { helper } from '@utils/helper';
import { DbInstance } from '@src/type/model';
import { DataMode } from '@src/schema/DataMode';
import { DeviceType } from '@src/schema/socket/DeviceType';
import { FetchState, ParseState } from '@src/schema/socket/DeviceState';
import { TableName } from '@src/schema/db/TableName';
import CCaseInfo from '@src/schema/CCaseInfo';
import { CaseJson, DeviceJson } from './componentType';

const { sep } = path;
const getDb = remote.getGlobal('getDb');

/**
 * 导入设备
 * @param devicePath 设备路径
 */
async function importDevice(devicePath: string) {
    const deviceDb: DbInstance = getDb(TableName.Device);
    try {
        const [deviceJson, caseJson]: [DeviceJson, CaseJson] = await Promise.all([
            helper.readJSONFile(path.join(devicePath, './Device.json')),
            helper.readJSONFile(path.join(devicePath, '../../Case.json'))
        ]);

        const nextCase = await getCaseByName(caseJson, path.join(devicePath, '../../'));
        const current = await deviceDb.find({ mobileName: deviceJson.mobileName });
        if (current.length === 0) {
            const nextDevice = new DeviceType();
            nextDevice.caseId = nextCase._id;
            nextDevice.id = helper.newId();
            nextDevice.mobileHolder = deviceJson.mobileHolder;
            nextDevice.mobileName = deviceJson.mobileName;
            nextDevice.mobileNo = deviceJson.mobileNo;
            nextDevice.note = deviceJson.note;
            nextDevice.mode = deviceJson.mode ?? DataMode.Self;
            nextDevice.phonePath = devicePath;
            nextDevice.fetchTime = getTimeFromPath(devicePath);
            nextDevice.parseState = ParseState.NotParse;
            nextDevice.fetchState = FetchState.Finished;

            await deviceDb.insert(nextDevice);
        }

    } catch (error) {
        throw error;
    }
}

/**
 * 按案件名称查询案件数据，案件不存在则创建
 * @param caseJson Case.json
 * @param casePath 案件路径
 */
async function getCaseByName(caseJson: CaseJson, casePath: string) {
    const db: DbInstance = getDb(TableName.Case);
    try {
        const [current] = await db.find({ m_strCaseName: caseJson.caseName });
        if (current) {
            //案件存在
            return current as CCaseInfo;
        } else {
            //案件不存在
            const nextCase = new CCaseInfo();
            nextCase.m_strCaseName = caseJson.caseName;
            nextCase.m_strCheckUnitName = caseJson.checkUnitName;
            nextCase.officerName = caseJson.officerName;
            nextCase.officerNo = caseJson.officerNo;
            nextCase.securityCaseName = caseJson.securityCaseName;
            nextCase.securityCaseNo = caseJson.securityCaseNo;
            nextCase.securityCaseType = caseJson.securityCaseType;
            nextCase.handleCaseName = caseJson.handleCaseName;
            nextCase.handleCaseNo = caseJson.handleCaseNo;
            nextCase.handleCaseType = caseJson.handleCaseType;

            nextCase._id = helper.newId();
            nextCase.m_Applist = [];
            nextCase.tokenAppList = [];
            nextCase.sdCard = true;
            nextCase.m_bIsAutoParse = true;
            nextCase.attachment = false;
            nextCase.isDel = false;
            nextCase.hasReport = true;
            nextCase.m_strCasePath = casePath;
            await db.insert(nextCase);
            return nextCase;
        }
    } catch (error) {
        throw error;
    }
}

/**
 * 截取路径时间戳
 * @param dir 路径
 */
function getTimeFromPath(dir: string) {
    const chunk = dir.split(sep);
    const [, timestamp] = chunk[chunk.length - 1].split('_');

    try {
        return helper.parseDate(timestamp, 'YYYYMMDDHHmmss').toDate();
    } catch (error) {
        return new Date();
    }
}

export { importDevice };