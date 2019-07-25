import React from 'react';
import { Spin } from 'antd';
import './Loading.less';

/**
 * 小菊花组件
 */
function Loading(props: any) {
    return <div className="loading"><Spin {...props} /></div>
}

export default Loading;