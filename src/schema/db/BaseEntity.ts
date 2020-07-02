/**
 * 数据库对象的基类
 */
class BaseEntity {
    /**
     * NeDB生成的id值
     */
    public _id?: string;
    /**
     * 记录创建时间
     */
    public createdAt?: Date;
    /**
     * 记录更新时间
     */
    public updatedAt?: Date;
}

export { BaseEntity };