/**
 * App图标组件类型
 */
interface IApps {
    fetch: ICategory[];
}

/**
 * App分类
 */
interface ICategory {
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
    app_list: IIcon[];
}

/**
 * 单个App信息
 */
interface IIcon {
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

export { IIcon, ICategory, IApps }