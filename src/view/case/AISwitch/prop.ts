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