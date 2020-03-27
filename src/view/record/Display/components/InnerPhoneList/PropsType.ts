import { Dispatch } from 'redux';
import { UIRetOneInfo } from '@src/schema/UIRetOneInfo';

/**
 * 组件属性
 */
export interface IProp {
    /**
     * 数据
     */
    data: UIRetOneInfo[];
    /**
     * BCP程序是否正在运行中
     */
    isRunning: boolean;
    /**
     * 派发方法
     */
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
