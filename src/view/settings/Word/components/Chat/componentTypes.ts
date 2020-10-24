interface Prop {

};

interface ChatData {
    /**
     * id
     */
    id?: string,
    /**
     * 分类
     */
    sort: string,
    /**
     * 级别
     */
    level: string,
    /**
     * 关键字列表
     */
    children: string[]
}

export { Prop, ChatData };