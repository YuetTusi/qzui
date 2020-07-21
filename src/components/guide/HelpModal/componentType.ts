interface Prop {
    /**
     * 是否显示
     */
    visible: boolean;
    /**
     * 默认选项卡
     */
    defaultTab?: string;
    /**
     * 确定回调
     */
    okHandle?: () => void;
    /**
     * 取消回调
     */
    cancelHandle?: () => void;
};

export { Prop };