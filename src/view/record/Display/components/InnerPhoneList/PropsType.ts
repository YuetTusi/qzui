import { Dispatch } from 'redux';
import { UIRetOneInfo } from '@src/schema/UIRetOneInfo';

/**
 * 组件属性
 */
export interface IProp {
    data: UIRetOneInfo[];
    dispatch: Dispatch<any>;
    parsingHandle: (arg0: UIRetOneInfo) => void;
    detailHandle: (arg0: UIRetOneInfo) => void;
}
