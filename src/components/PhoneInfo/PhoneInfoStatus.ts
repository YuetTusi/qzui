/**
 * 组件状态枚举
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
     * 采集完成
     */
    FETCHEND,
    /**
     * 监听中(小圆圈)
     */
    WAITING
}