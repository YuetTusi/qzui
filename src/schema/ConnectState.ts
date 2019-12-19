/**
 * 设备连接状态
 */
export enum ConnectSate {
    /**
     * 未连接
     */
    not_connect = 0,
    /**
     * 已连接
     */
    has_connect,
    /**
     * 采集中
     */
    fetching,
    /**
     * 降级备份中
     */
    fetch_downgrading,
    /**
     * 降级备份结束
     */
    fetch_downgrading_end,
    /**
     * 采集完成
     */
    fetchend
};