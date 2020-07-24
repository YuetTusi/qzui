
interface Prop {
    /**
     * 是否显示
     */
    visible: boolean;
    /**
     * 上传中
     */
    loading?: boolean;
    /**
     * 上传回调
     */
    uploadHandle?: (arg0: string[]) => void;
    /**
     * 取消
     */
    cancelHandle?: () => void;
};

export { Prop };