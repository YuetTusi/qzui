import React, { FC } from 'react';
import './NoWrapText.less';

interface Prop {
    /**
     * 文本宽度
     */
    width: number | string;
    /**
     * 对齐方向
     */
    align?: 'left' | 'center' | 'right';
};

/**
 * 不换行文本
 * @param props 
 */
const NoWrapText: FC<Prop> = (props) => {

    return <span
        className="az-no-wrap-text"
        title={props.children?.toString()}
        style={{ width: props.width, textAlign: props.align ? props.align : 'left' }}>
        {props.children}
    </span>;

};

NoWrapText.defaultProps = {
    width: 100,
    align: 'left'
};

export default NoWrapText;
