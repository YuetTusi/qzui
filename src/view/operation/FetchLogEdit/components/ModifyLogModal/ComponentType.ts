import CFetchLog from "@src/schema/CFetchLog";

interface Prop {
    /**
     * 是否显示
     */
    visible: boolean;
    /**
     * 当前编辑的数据
     */
    entity?: CFetchLog;
    /**
     * 编辑回调
     */
    okHandle?: (arg0: any) => void;
    /**
     * 取消回调
     */
    cancelHandle?: () => void;
};

export { Prop };