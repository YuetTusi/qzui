import { AppCategory } from "@src/schema/AppConfig";
import { ITreeNode } from "@src/type/ztree";

/**
 * 属性
 */
interface Prop {
    /**
     * 是否显示
     */
    visible: boolean,
    /**
     * 标题
     */
    title?: string,
    /**
     * App数据
     */
    treeData: AppCategory[],
    /**
     * 选中的key
     */
    selectedKeys: string[],
    /**
     * 关闭handle
     */
    closeHandle: () => void,
    /**
     * 确认选择handle
     */
    okHandle: (data: ITreeNode[]) => void
};

export { Prop };