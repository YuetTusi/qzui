interface Prop { }

interface State {
    /**
     * 是否捕获错误
     */
    hasError: boolean;
    /**
     * Error
     */
    err?: Error;
    /**
     * ErrorInfo
     */
    errInfo?: any;
}

export { Prop, State };