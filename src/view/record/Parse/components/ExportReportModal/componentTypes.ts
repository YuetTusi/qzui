import DeviceType from "@src/schema/socket/DeviceType";
import { ITreeNode } from "@src/type/ztree";

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
interface ZTreeNode extends ITreeNode {
    /**
     * 图标
     */
    _icon?: string,
    /**
     * 数据文件路径
     */
    path: string,
    /**
     * 显示类型
     */
    type: string,
    /**
     * 页数
     */
    page?: number,
    /**
     * 附件清单文件
     */
    attach?: string
}

interface CopyTo {
    //源路径
    from: string,
    //拷贝目的路径
    to: string,
    //重命名
    rename: string
}

export { Prop, ZTreeNode, CopyTo };