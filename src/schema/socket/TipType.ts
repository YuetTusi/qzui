
/**
 * 消息类型
 */
enum TipType {
    /**
     * 无消息
     */
    Nothing = 'nothing',
    /**
     * 问题消息（用户必回复是否）
     */
    Question = 'question',
    /**
     * 有引导图的消息（用户可自行关闭，不影响流程）
     */
    Guide = 'guide',
    /**
     * 有引导图的消息（用户必回复是否）
     */
    RequiredGuide = 'required_guide'
}

export { TipType };
export default TipType;