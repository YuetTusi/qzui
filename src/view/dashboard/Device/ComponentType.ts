import { StoreComponent } from "@src/type/model";
import { StoreState } from '@src/model/dashboard/Device';

interface Prop extends StoreComponent {
    /**
     * 仓库数据
     */
    device: StoreState;
}

interface State {
    /**
     * 显示案件输入框
     */
    caseModalVisible: boolean;
    /**
     * 显示采集记录框
     */
    fetchRecordModalVisible: boolean;
    /**
     * 显示USB调试模式框
     */
    usbDebugWithCloseModalVisible: boolean;
    /**
     * iPhone信任设备弹框
     */
    appleModalVisible: boolean;
    /**
     * 显示帮助框
     */
    debugHelpModalVisible: boolean;
}

export { Prop, State };