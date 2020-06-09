import { helper } from "./helper";
import FetchCommond from "@src/schema/GuangZhou/FetchCommond";
import CFetchDataInfo from "@src/schema/CFetchDataInfo";
import { CBCPInfo } from "@src/schema/CBCPInfo";
import { stPhoneInfoPara } from "@src/schema/stPhoneInfoPara";
import CCaseInfo from "@src/schema/CCaseInfo";

//NOTE:警综平台数据与系统数据转换方法，在此扩展

/**
 * 广州警综平台数据转为采集案件数据
 * @param data 平台数据
 * @param caseData 案件数据（此案件是从平台数据创建的案件）
 * @param phone 采集手机数据
 * @param fetchType 采集类型
 */
const GuangZhouPlantform2Case = (data: FetchCommond, caseData: CCaseInfo, phone: stPhoneInfoPara, fetchType: number): CFetchDataInfo => {
    console.log(phone);
    let caseEntity = new CFetchDataInfo();
    caseEntity.m_strCaseName = caseData.m_strCaseName;
    caseEntity.m_strThirdCheckerID = data.OfficerID;
    caseEntity.m_strThirdCheckerName = data.OfficerName;
    caseEntity.m_strDeviceID = phone.piSerialNumber! + phone.piLocationID;
    caseEntity.m_strDeviceName = `${phone.piModel}_${helper.timestamp()}`;
    caseEntity.m_strDeviceNumber = data.Phone;
    caseEntity.m_strDeviceHolder = data.OwnerName;
    caseEntity.m_nFetchType = fetchType;
    let bcpEntity = new CBCPInfo();
    bcpEntity.m_strCheckerID = data.OfficerID;
    bcpEntity.m_strCheckerName = data.OfficerName;
    bcpEntity.m_strCheckOrganizationID = data.dept;
    bcpEntity.m_strCheckOrganizationName = data.deptName;
    bcpEntity.m_strDstOrganizationID = data.dept;
    bcpEntity.m_strDstOrganizationName = data.deptName;
    bcpEntity.m_strCertificateType = data.IdentityIDType;
    bcpEntity.m_strCertificateCode = data.IdentityID;
    // bcpEntity.m_strCertificateIssueUnit = data.m_BCPInfo?.m_strCertificateIssueUnit;
    // bcpEntity.m_strCertificateEffectDate = data.m_BCPInfo?.m_strCertificateEffectDate;
    // bcpEntity.m_strCertificateInvalidDate = data.m_BCPInfo?.m_strCertificateInvalidDate;
    bcpEntity.m_strSexCode = '0';
    bcpEntity.m_strNation = data.MinzuCode;
    // bcpEntity.m_strBirthday
    bcpEntity.m_strAddress = data.Hjdz;
    // bcpEntity.m_strUserPhoto = data.m_BCPInfo?.m_strUserPhoto;
    caseEntity.m_BCPInfo = bcpEntity;
    return caseEntity;
};

export { GuangZhouPlantform2Case };