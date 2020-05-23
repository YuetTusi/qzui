/**
 * 一页的数据
 */
interface OneStepData {
    /**
     * 标题
     */
    title: string,
    /**
     * 步骤描述
     */
    description?: string,
    /**
     * 本页内容
     */
    content: string | JSX.Element
}

/**
 * 组件属性
 */
interface Prop {
    //分步数据
    steps: Array<OneStepData>;
    //是否显示
    visible: boolean;
    //完成回调
    finishHandle?: () => void;
    //取消回调
    cancelHandle?: () => void;
    //宽度，默认500
    width?: number;
    //标题
    title?: string;
}

export { Prop, OneStepData };