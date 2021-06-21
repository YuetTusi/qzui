import { StoreComponent } from "@src/type/model";
import { CloudCodeModalStoreState } from "@src/model/components/CloudCodeModal";
import { DeviceType } from "@src/schema/socket/DeviceType";
import { DashboardStore } from "@src/model/dashboard";

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
     * DashboardState
     */
    dashboard: DashboardStore;
    /**
     * 取消handle
     */
    cancelHandle: () => void;
}
