import { StoreComponent } from "@src/type/model";
import { StoreState } from '@src/model/dashboard/Device';
import DeviceType from "@src/schema/socket/DeviceType";

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
    helpModalVisible: boolean;
    /**
     * 显示引导提示框
     */
    guideModalVisible: boolean;
    /**
     * 苹果iTunes备份密码确认弹框
     */
    applePasswordModalVisible: boolean;
}

/**
 * 上下文
 */
interface Context {
    /**
     * 取证Handle
     */
    collectHandle: (data: DeviceType) => void;
    /**
     * 采集异常记录Handle
     */
    errorHandle: (data: DeviceType) => void;
    /**
     * 停止取证Handle
     */
    stopHandle: (data: DeviceType) => void;
    /**
     * 消息链接Handle
     */
    msgLinkHandle: (data: DeviceType) => void;
    /**
     * 属性
     */
    props: Prop;
    /**
     * 状态
     */
    state: State;
}

export { Context, Prop, State };