/**
 * 采集状态
 */
export enum FetchState {
    /**
     * 等待连接
     */
    Waiting = 'Waiting',
    /**
     * 未连接
     */
    NotConnected = 'NotConnected',
    /**
     * 已连接
     */
    Connected = 'Connected',
    /**
     * 采集中
     */
    Fetching = 'Fetching',
    /**
     * 采集完成
     */
    Finished = 'Finished',
    /**
     * 采集有误
     */
    HasError = 'HasError'
}

/**
 * 解析状态
 */
export enum ParseState {
    /**
     * 仍在采集中
     */
    Fetching = 'Fetching',
    /**
     * 尚未解析
     */
    NotParse = 'NotParse',
    /**
     * 解析中
     */
    Parsing = 'Parsing',
    /**
     * 解析完成
     */
    Finished = 'Finished',
    /**
     * 解析失败
     */
    Error = 'Error'
}