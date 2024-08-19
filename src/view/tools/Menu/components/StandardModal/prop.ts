export interface StandardModalProp {

    /**
     * 打开/关闭
     */
    open: boolean,
    /**
     * 默认值
     */
    defaultValue?: string[],
    /**
     * 取消handle
     * @returns 
     */
    onCancel: () => void,
    /**
     * 确定handle
     * @returns 
     */
    onOk: (values: string[]) => void
}

export interface StandardJson {
    /**
     * 国标
     */
    gb: { value: string, disabled: boolean, checked: boolean }[],
    /**
     * 司法
     */
    sf: { value: string, disabled: boolean, checked: boolean }[]
}