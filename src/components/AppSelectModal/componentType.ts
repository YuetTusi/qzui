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

/**
 * App分类
 */
interface AppCategory {
    /**
     * 分类名称
     */
    class: string;
    /**
     * 名称
     */
    name: string;
    /**
     * 描述
     */
    desc: string;
    /**
     * 只读标识
     */
    readonly: number;
    /**
     * 展开标识
     */
    open: boolean;
    /**
     * App列表
     */
    app_list: App[];
}

/**
 * 单个App信息
 */
interface App {
    /**
     * 应用名
     */
    name: string;
    /**
     * App包名
     */
    packages: string[];
    /**
     * id
     */
    app_id: string;
    /**
     * 描述
     */
    desc: string;
    /**
     * 是否选中（1:选中 0:未选中）
     */
    select: number;
    /**
     * 是否只读 (1:只读 0:非只读)
     */
    readonly: number;
}

export { Prop, App, AppCategory };