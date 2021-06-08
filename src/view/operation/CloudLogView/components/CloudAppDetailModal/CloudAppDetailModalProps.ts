import { StoreComponent } from '@src/type/model';
import { DashboardStore } from "@src/model/dashboard";
import { CloudAppMessages } from "@src/schema/socket/CloudAppMessages";

interface CloudAppDetailModalProps extends StoreComponent {
    /**
     * 是否显示
     */
    visible: boolean,
    /**
     * 应用
     */
    apps: CloudAppMessages[],
    /**
     * 取消handle
     */
    cancelHandle: () => void,
    /**
     * Dashboard仓库State
     */
    dashboard: DashboardStore
}

export { CloudAppDetailModalProps }