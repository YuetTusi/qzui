import React, { PropsWithChildren } from 'react';
import { Spin } from 'antd';
import './Loading.less';

interface IProp {
    show: any;
}

/**
 * 小菊花组件
 */
function Loading(props: PropsWithChildren<IProp>) {

    return <div className="loading" style={{ display: props.show === 'true' ? 'block' : 'none' }}>
        <Spin {...props} />
    </div>
}

export default Loading;