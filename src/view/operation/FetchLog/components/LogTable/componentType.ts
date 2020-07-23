import FetchLogEntity from '@src/schema/socket/FetchLog';
import { Context } from '../../componentType';

interface Prop {
    /**
     * 当前页
     */
    current: number;
    /**
     * 页尺寸
     */
    pageSize: number;
    /**
     * 记录总数
     */
    total: number;
    /**
     * 加载中
     */
    loading: boolean;
    /**
     * 数据
     */
    data: FetchLogEntity[];
    /**
     * 父组件上下文
     */
    context: Context;
};

export { Prop };