import { AnyAction } from 'redux';
import { Model, EffectsCommandMap } from 'dva';
import { CCheckOrganization } from '@src/schema/CCheckOrganization';
import { CBCPInfo } from '@src/schema/CBCPInfo';
import { fetcher } from '@src/service/rpc';

interface StoreState {
    /**
     * 检验单位列表
     */
    unitList: CCheckOrganization[];
    /**
     * BCP数据
     */
    bcpInfo: CBCPInfo;
}

/**
 * BCP录入框模型,对应组件：view/record/Display/components/BcpModal
 */
let model: Model = {
    namespace: 'bcpModal',
    state: {
        unitList: [],
        bcpInfo: {}
    },
    reducers: {
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
            }
        }
    },
    effects: {
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
         * 查询BCP数据
         * @param payload 手机绝对路径
         */
        *queryBcp({ payload }: AnyAction, { call, put }: EffectsCommandMap) {
            try {
                let result: CBCPInfo = yield call([fetcher, 'invoke'], 'GetBCPInfo', [payload]);
                yield put({ type: 'setBcpInfo', payload: result });
            } catch (error) {
                console.log(`@modal/record/Display/BcpModal.ts/queryBcp:${error.message}`);
            }
        },
        /**
         * 保存BCP数据
         */
        *saveBcp({ payload }: AnyAction, { fork }: EffectsCommandMap) {
            const { data, phonePath } = payload;
            try {
                yield fork([fetcher, 'invoke'], 'SaveBCPInfo', [phonePath, new CBCPInfo({
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
            }
        }
    }
};

export { StoreState };
export default model;