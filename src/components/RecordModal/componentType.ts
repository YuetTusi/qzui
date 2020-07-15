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
     * 取消回调
     */
    cancelHandle?: () => void;
};