import { StoreComponent } from "@src/type/model";
import { IStoreState, ExtendPhoneInfoPara } from '@src/model/dashboard/Init/Init';
import { StoreData as DashboardStoreData } from '@src/model/dashboard/index';

interface Prop extends StoreComponent {
    /**
     * initModel
     */
    init: IStoreState;
    /**
     * dashboardModel
     */
    dashboard: DashboardStoreData;
}

interface State {
    //显示案件输入框
    caseModalVisible: boolean;
    //显示打开USB调试模式
    usbDebugModalVisible: boolean;
    //iPhone信任提示弹框
    appleModalVisible: boolean;
}

export { Prop, State };