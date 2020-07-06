/**
 * Socket通讯对象基类
 */
interface Base {
    /**
     * 命令
     */
    cmd?: string;
    /**
     * 类型(区分socket分类)
     */
    type?: string;
}

export { Base };
export default Base;