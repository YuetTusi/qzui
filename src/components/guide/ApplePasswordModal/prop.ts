interface ApplePasswordModalProp {
    /**
     * 是否显示
     */
    visible: boolean;
    /**
     * USB序号
     */
    usb?: number;
    /**
     * 密码确认Handle
     */
    confirmHandle: (password: string, usb?: number) => void;
    /**
     * 不知道密码且继续Handle
     */
    withoutPasswordHandle: (usb?: number) => void;
    /**
     * 放弃Handle
     */
    cancelHandle: (usb?: number) => void;
    /**
     * 右上角关闭
     */
    closeHandle: () => void;
};

export { ApplePasswordModalProp };