import FetchRecord from "@src/schema/socket/FetchRecord";

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
    data?: FetchRecord[];
    /**
     * 是否自动滚动到底部
     */
    isScrollToBottom?: boolean;
    /**
     * 取消回调
     */
    cancelHandle?: () => void;
};