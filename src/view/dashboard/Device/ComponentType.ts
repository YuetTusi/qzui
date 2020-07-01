import { StoreComponent } from "@src/type/model";
import { StoreState } from '@src/model/dashboard/Init';

interface Prop extends StoreComponent {
    device: StoreState;
}

interface State {
    /**
     * 显示案件输入框
     */
    caseModalVisible: boolean;
    /**
     * 显示USB调试模式框
     */
    usbDebugWithCloseModalVisible: boolean;
    /**
     * iPhone信任设备弹框
     */
    appleModalVisible: boolean;
}

export { Prop, State };