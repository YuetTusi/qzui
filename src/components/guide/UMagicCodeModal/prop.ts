interface UMagicCodeModalProp {

    /**
     * 显示
     */
    visible: boolean,
    /**
     * USB序号
     */
    usb: number
    /**
     * 关闭handle
     */
    closeHandle: () => void,
    /**
     * 确定handle
     */
    okHandle: (usb: number, code: string) => void
}

export { UMagicCodeModalProp }