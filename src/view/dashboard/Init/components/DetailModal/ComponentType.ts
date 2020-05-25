import { MouseEvent } from 'react';
import { DetailMessage } from "@src/type/DetailMessage";

interface Prop {
    /**
     * 隐藏/显示详情框
     */
    visible: boolean;
    /**
     * 详情实时数据
     */
    message: DetailMessage;
    /**
     * 取消回调
     */
    cancelHandle?: (event: MouseEvent<HTMLElement>) => void;
}

export { Prop };