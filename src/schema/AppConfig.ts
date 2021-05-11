/**
 * App分类
 */
export interface AppCategory {
    /**
     * 分类名称
     */
    class: string,
    /**
     * 名称
     */
    name: string,
    /**
     * 描述
     */
    desc: string,
    /**
     * 只读标识
     */
    readonly: number,
    /**
     * 展开标识
     */
    open: boolean,
    /**
     * App列表
     */
    app_list: App[]
}

/**
 * 单个App信息
 */
export interface App {
    /**
     * 应用名
     */
    name: string,
    /**
     * App包名
     */
    packages: string[],
    /**
     * 应用Key值（云取）
     */
    key: string,
    /**
     * id
     */
    app_id: string,
    /**
     * 描述
     */
    desc: string,
    /**
     * 其他属性
     */
    [extraProp: string]: any
}