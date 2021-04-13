/**
 * 图形验证参数
 */
interface HumanVerify {
    /**
     * 时间戳
     */
    date: number,
    /**
     * 滑块参数
     */
    slider: Slider,
    /**
     * 类型
     */
    type: 'ARTIFICIAL_CLICK_WORD' | 'ARTIFICIAL_BLOCK_PUZZLE',
    /**
     * 缺块图
     */
    jigsaw_img: JigsawImg,
    /**
     * 背景图
     */
    back_img: BackImg,
    /**
     * 提示
     */
    tips: VerifyTips
}

/**
 * 滑块参数
 */
interface Slider {
    /**
     * 滑块宽度
     */
    width: number,
    /**
     * 滑块高度
     */
    height: number
}

/**
 * 缺块参数
 */
interface JigsawImg {
    /**
     * 缺块base64
     */
    base64: string,
    /**
     * 缺块宽度
     */
    width: number,
    /**
     * 缺块高度
     */
    height: number,
    /**
     * 滑块初始样式
     */
    style: any
}

interface VerifyTips {

    /**
     * 点选位置描述
     */
    check: string,
    /**
     * 点选提示
     */
    content: string
}

/**
 * 背景图参数
 */
interface BackImg {
    /**
     * 背景base64
     */
    base64: string,
    /**
     * 背景宽度
     */
    width: number,
    /**
     * 背景高度
     */
    height: number,
}

export { HumanVerify };