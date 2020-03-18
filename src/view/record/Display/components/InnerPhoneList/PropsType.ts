import { Dispatch } from 'redux';
import { UIRetOneInfo } from '@src/schema/UIRetOneInfo';

/**
 * 组件属性
 */
export interface IProp {
    data: UIRetOneInfo[];
    dispatch: Dispatch<any>;
    /**
     * 手动解析
     */
    parsingHandle: (arg0: UIRetOneInfo) => void;
    /**
     * 详情
     */
    detailHandle: (arg0: UIRetOneInfo) => void;
    /**
     * 生成BCP
     */
    bcpHandle: (arg0: UIRetOneInfo) => void;
}
