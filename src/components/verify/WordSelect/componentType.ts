interface Prop {

    /**
     * 验证字数
     */
    size: number,
    /**
     * 图片数据源
     */
    src: string,
    /**
     * 图片宽
     */
    width: number,
    /**
     * 图片高
     */
    height: number,
    /**
     * 验证回调
     */
    onValid: (values: { x: number, y: number }[]) => void;
};

export { Prop }