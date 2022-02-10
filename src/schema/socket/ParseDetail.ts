
/**
 * 解析详情（单条）
 */
interface ParseDetail {
    /**
     * 案件id
     */
    caseId: string,
    /**
     * 设备id
     */
    deviceId: string,
    /**
     * 进度详情
     */
    curinfo: string,
    /**
     * 进度百分比
     */
    curprogress: number
}

export default ParseDetail;