import { AiSwitchState } from '@src/model/case/AISwitch';
import { Dispatch } from 'redux';

export interface Predict {
    /**
     * AI分类名称
     */
    title: string,
    /**
     * 是否开启
     */
    use: boolean,
    /**
     * 是否隐藏
     */
    hide: boolean,
    /**
     * 说明
     */
    tips: string,
    /**
     * 后台所需属性
     */
    type: string,
    /**
     * 后台所需属性
     */
    subtype: string[]
}

export interface AiSwitchProp {

    /**
     * 案件路径
     */
    casePath?: string,
    /**
     * ReduxModel
     */
    aiSwitch?: AiSwitchState
    /**
     * dispatch
     */
    dispatch: Dispatch<any>
}

export interface PredictJson {
    /**
     * AI项
     */
    config: Predict[],
    /**
     * 相似度
     */
    similarity: number,
    /**
     * 使用OCR识别
     */
    ocr: boolean
}

/**
 * 兼容旧版本predict.json类型
 * 在添加相似度配置前，此JSON是一个Array类型，现是对象
 */
export type PredictComp = PredictJson | Predict[];