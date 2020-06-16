/**
 * 设备连接状态
 */
export enum ConnectState {
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
     * 正在检查设备连接状态
     */
    CHECK_STATE,
    /**
     * 监听中(小圆圈)
     */
    WAITING
};