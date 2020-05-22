import { Model, EffectsCommandMap } from 'dva';
import { AnyAction } from 'redux';
import { CCheckerInfo } from '@src/schema/CCheckerInfo';
import { CCheckOrganization } from '@src/schema/CCheckOrganization';
import { CBCPInfo } from '@src/schema/CBCPInfo';
import CCaseInfo from '@src/schema/CCaseInfo';
import { fetcher } from '@src/service/rpc';
import logger from '@src/utils/log';

interface StoreData {
    /**
     * 检验员列表
     */
    officerList: CCheckerInfo[];
    /**
     * 检验单位列表
     */
    unitList: CCheckOrganization[];
    /**
     * BCP数据
     */
    bcpInfo: CBCPInfo;
    /**
     * 案件数据
     */
    caseData: CCaseInfo;
}

let model: Model = {

    namespace: 'bcpInputModal',
    state: {
        officerList: [],
        unitList: [],
        bcpInfo: {},
        caseData: {}
    },
    reducers: {
        setOfficerList(state: any, action: AnyAction) {
            return { ...state, officerList: [...action.payload] };
        },
        setUnitList(state: any, action: AnyAction) {
            return {
                ...state,
                unitList: [...action.payload]
            };
        },
        setBcpInfo(state: any, action: AnyAction) {
            return {
                ...state,
                bcpInfo: { ...action.payload }
            };
        },
        resetBcpInfo(state: any, action: AnyAction) {
            return {
                ...state,
                bcpInfo: {}
            }
        },
        setCaseData(state: any, action: AnyAction) {
            return {
                ...state,
                caseData: { ...action.payload }
            };
        }
    },
    effects: {
        /**
 * 查询检验员下拉数据
 */
        *queryOfficerList(action: AnyAction, { call, put }: EffectsCommandMap) {
            try {
                let result = yield call([fetcher, 'invoke'], 'GetCheckerInfo', []);
                yield put({ type: 'setOfficerList', payload: result });
            } catch (error) {
                console.log(`@model/record/Display/BcpModal.ts/queryOfficerList:${error.message}`);
            }
        },
        /**
         * 查询检验单位下拉数据
         */
        *queryUnitData({ payload }: AnyAction, { call, put }: EffectsCommandMap) {
            try {
                let result = yield call([fetcher, 'invoke'], 'GetCheckOrganizationList', [payload, 0]);
                yield put({ type: 'setUnitList', payload: result });
            } catch (error) {
                console.log(`@modal/record/Display/BcpModal.ts/queryUnitData:${error.message}`);
            }
        },
        /**
         * 查询案件数据
         * 传案件绝对路径
         */
        *queryCase({ payload }: AnyAction, { call, put }: EffectsCommandMap) {
            try {
                let data: CCaseInfo = yield call([fetcher, 'invoke'], 'GetSpecCaseInfo', [payload]);
                yield put({ type: 'setCaseData', payload: data });
            } catch (error) {
                console.log(`查询失败：${error.message}`);
            }
        },
        /**
         * 查询BCP数据
         * @param payload 手机绝对路径
         */
        *queryBcp({ payload }: AnyAction, { call, put }: EffectsCommandMap) {
            try {
                let result: CBCPInfo = yield call([fetcher, 'invoke'], 'GetBCPInfo', [payload]);
                yield put({ type: 'setBcpInfo', payload: result });
            } catch (error) {
                console.log(`@modal/record/Display/BcpModal.ts/queryBcp:${error.message}`);
                logger.error(`@modal/record/Display/BcpModal.ts/queryBcp:${error.message}`);
            }
        },
        /**
         * 保存BCP数据
         */
        *saveBcp({ payload }: AnyAction, { fork }: EffectsCommandMap) {
            const { data, phonePath } = payload;
            try {
                yield fork([fetcher, 'invoke'], 'SaveBCPInfo', [phonePath, new CBCPInfo({
                    m_strCheckerID: data.m_strCheckerID,
                    m_strCheckerName: data.m_strCheckerName,
                    m_strCheckOrganizationID: data.m_strCheckOrganizationID,
                    m_strCheckOrganizationName: data.m_strCheckOrganizationName,
                    m_strDstOrganizationID: data.m_strDstOrganizationID,
                    m_strDstOrganizationName: data.m_strDstOrganizationName,
                    m_strBCPCheckOrganizationName: data.m_strBCPCheckOrganizationName,
                    m_strBCPCheckOrganizationID: data.m_strBCPCheckOrganizationID,
                    m_strCertificateType: data.m_strCertificateType,
                    m_strCertificateCode: data.m_strCertificateCode,
                    m_strCertificateIssueUnit: data.m_strCertificateIssueUnit,
                    m_strCertificateEffectDate: data.m_strCertificateEffectDate,
                    m_strCertificateInvalidDate: data.m_strCertificateInvalidDate,
                    m_strSexCode: data.m_strSexCode,
                    m_strNation: data.m_strNation,
                    m_strBirthday: data.m_strBirthday,
                    m_strAddress: data.m_strAddress,
                    m_strUserPhoto: data.m_strUserPhoto
                })]);
            } catch (error) {
                console.log(`@modal/record/Display/BcpModal.ts/saveBcp:${error.message}`);
                logger.error(`@modal/record/Display/BcpModal.ts/saveBcp:${error.message}`);
            }
        }
    }
};

export { StoreData };
export default model;