interface TitleProp {
    //右侧按钮文本
    okText?: string;
    //右侧按钮回调
    onOk?: () => any;
    //OK按钮属性
    okButtonProps?: TitleButtonProps;
    //返回按钮文本
    returnText?: string;
    //返回按钮回调
    onReturn?: () => any;
    //返回按钮属性
    returnButtonProps?: TitleButtonProps;
}

interface TitleButtonProps {
    /**
     * 是否禁用
     */
    disabled?: boolean;
    /**
     * 按钮Icon
     */
    icon?: string;
}

export { TitleProp, TitleButtonProps }