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
    class: string;
    name: string;
    desc: string;
    select: number;
    state: number;
    state_text: string;
    progress: string;
    progress_text: string;
    open: boolean;
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
    app_type: string;
    route_app_type: string;
    /**
     * 描述
     */
    desc: string;
    /**
     * 是否选中（1:选中 0:未选中）
     */
    select: number;
    state: number;
    state_text: string;
    progress: number;
    progress_text: string;
}

export { IIcon, ICategory, IApps }