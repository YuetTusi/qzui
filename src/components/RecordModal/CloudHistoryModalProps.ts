import { StoreComponent } from "@src/type/model";
import { CloudCodeModalStoreState } from "@src/model/components/CloudCodeModal";
import { DeviceType } from "@src/schema/socket/DeviceType";

export interface Prop extends Partial<StoreComponent> {
    /**
     * 是否显示
     */
    visible: boolean;
    /**
     * 当前设备
     */
    device: DeviceType;
    /**
     * 仓库state
     */
    cloudCodeModal: CloudCodeModalStoreState;
    /**
     * 取消handle
     */
    cancelHandle: () => void;
}

/**
 * App分类
 */
export interface AppCategory {
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
    app_list: App[];
}

/**
 * 单个App信息
 */
export interface App {
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
