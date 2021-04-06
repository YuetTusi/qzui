interface LogListProp {
    /**
     * 日志
     */
    logs: [string, LogItem][];
}

/**
 * 发布日志
 */
interface LogItem {
    /**
     * 发布日期
     */
    Date: string;
    /**
     * Git ID
     */
    ID: string;
    /**
     * 更新说明
     */
    Item: string[];
}


export { LogListProp, LogItem };