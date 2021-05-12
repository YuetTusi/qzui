import { AppCategory } from "@src/schema/AppConfig";
import { ITreeNode } from "@src/type/ztree";

/**
 * 属性
 */
interface AppSelectModalProp {
    /**
     * 是否显示
     */
    visible: boolean,
    /**
     * 是否多选（多选为checkbox，单选为radio）
     */
    isMulti?: boolean,
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
 * 属性
 */
interface CloudAppSelectModalProp {
    /**
     * 是否显示
     */
    visible: boolean,
    /**
     * 是否多选（多选为checkbox，单选为radio）
     */
    isMulti?: boolean,
    /**
     * 标题
     */
    title?: string,
    /**
     * tree数据访问接口地址
     */
    url: string,
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
 * 云取应用说明
 */
interface CloudTips {
    /**
     * 无痕情况
     */
    note: string[],
    /**
     * 获取内容
     */
    content: string[]
}

export { AppSelectModalProp, CloudAppSelectModalProp, CloudTips };