import React, { FC } from 'react';

interface Prop {
    /**
     * 隐藏/显示
     */
    show: boolean;
    /**
     * 布局方式（对应CSS Display属性）
     */
    type?: 'block' | 'inline-block' | 'inline' | 'flex' | 'table' | 'inline-flex' | 'inline-table';
};

/**
 * 隐藏/显示切换组件
 */
const HiddenToggle: FC<Prop> = ({ show, type, children }) => {

    return <div style={{ display: show ? type : 'none' }}>
        {children}
    </div>;
};

HiddenToggle.defaultProps = {
    show: false,
    type: 'inline-block'
};

export default HiddenToggle;
