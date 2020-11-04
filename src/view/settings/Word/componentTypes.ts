import { StoreComponent } from "@src/type/model";

/**
 * 属性
 */
interface Prop {
}

/**
 * JSON文件分类
 */
enum SaveType {

    /**
     * 敏感词
     */
    Words,
    /**
     * 敏感应用
     */
    Apps,
    /**
     * 浏览器
     */
    Browser
}

/**
 * 关键词
 */
interface Keywords {
    /**
     * 分类
     */
    sort: string,
    /**
     * 风险级别（1,2,3级）
     */
    level: number,
    /**
     * 关键词
     */
    children: string[]
}

export { Prop, SaveType, Keywords };