/**
 * 属性
 */
interface Prop {
    /**
     * 背景图数据源
     */
    bgSrc: string;
    /**
     * 背景图宽
     */
    bgWidth: number;
    /**
     * 背景图高
     */
    bgHeight: number;
    /**
     * 滑块图数据源
     */
    gapSrc: string;
    /**
     * 滑块图宽
     */
    gapWidth: number;
    /**
     * 滑块图高
     */
    gapHeight: number;
    /**
     * 滑块初始样式
     */
    gapInitStyle: string;
    /**
     * 用户拼接后回调
     */
    onPiece: (value: number) => void;
}

export { Prop };