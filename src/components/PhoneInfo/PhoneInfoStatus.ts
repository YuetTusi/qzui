/**
 * 采集状态枚举
 */
export enum PhoneInfoStatus {
    /**
     * 未连接
     */
    NOT_CONNECT,
    /**
     * 已连接
     */
    HAS_CONNECT,
    /**
     * 采集中
     */
    FETCHING,
    /**
     * 降级备份中
     */
    FETCH_DOWNGRADING,
    /**
     * 降级备份结束
     */
    FETCH_DOWNGRADING_END,
    /**
     * 采集完成
     */
    FETCHEND,
    /**
     * 监听中(小圆圈)
     */
    WAITING
}