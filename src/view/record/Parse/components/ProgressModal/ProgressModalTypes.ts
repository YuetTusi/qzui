import { ProgressModalState } from "@src/model/record/Display/ProgressModal";
import { DeviceType } from "@src/schema/socket/DeviceType";

interface Prop {
    /**
     * 就否显示
     */
    visible: boolean;
    /**
     * 设备数据
     */
    device: DeviceType;
    /**
     * 取消Handle
     */
    cancelHandle: () => void;
    /**
     * 仓库State
     */
    progressModal: ProgressModalState;
};

export { Prop };