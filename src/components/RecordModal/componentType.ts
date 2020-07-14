/**
 * 记录
 */
export interface Record {
    /**
     * 记录类型（区分颜色、分类等）
     */
    type: string;
    /**
     * 记录内容
     */
    info: string;
}

/**
 * 属性
 */
export interface Prop {
    /**
     * 是否显示
     */
    visible: boolean;
    /**
     * 标题
     */
    title?: string;
    /**
     * 数据
     */
    data?: Record[];
    /**
     * 取消回调
     */
    cancelHandle?: () => void;
};