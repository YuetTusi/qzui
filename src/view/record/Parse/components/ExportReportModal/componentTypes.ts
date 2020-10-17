import DeviceType from "@src/schema/socket/DeviceType";

/**
 * 组件属性
 */
interface Prop {
    /**
     * 是否显示
     */
    visible: boolean,
    /**
     * 设备数据
     */
    device?: DeviceType,
    /**
     * 关闭handle
     */
    closeHandle?: () => void
}

/**
 * zTree树结点数据
 */
interface ZTreeNode {
    /**
     * 结点名称
     */
    name: string,
    /**
     * 数据文件路径
     */
    path: string,
    /**
     * 显示类型
     */
    type: string,
    /**
     * 图标路径
     */
    icon?: string,
    /**
     * 页数
     */
    page?: number,
    /**
     * 附件清单文件
     */
    attach?: string,
    /**
     * 子结点
     */
    children?: ZTreeNode[],
    /**
     * 其它属性
     */
    [zTreeExtraProps: string]: any
}

interface CopyTo {
    //源路径
    from: string,
    //拷贝目的路径
    to: string
}

export { Prop, ZTreeNode, CopyTo };