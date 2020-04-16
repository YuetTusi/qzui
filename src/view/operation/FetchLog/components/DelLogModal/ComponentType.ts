/**
 * 组件属性
 */
export interface Prop {
    /**
     * 是否显示
     */
    visible: boolean;
    /**
     * 确定回调
     */
    okHandle?: (arg0: DelLogType) => void;
    /**
     * 取消回调
     */
    cancelHandle?: () => void;
};

/**
 * 清理时段枚举
 */
export enum DelLogType {
    /**
     * 六个月前
     */
    SixMonthsAgo,
    /**
     * 一年前
     */
    OneYearAgo,
    /**
     * 两年前
     */
    TwoYearsAgo
}