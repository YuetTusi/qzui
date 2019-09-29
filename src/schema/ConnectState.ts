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
     * 采集完成
     */
    fetchend
};