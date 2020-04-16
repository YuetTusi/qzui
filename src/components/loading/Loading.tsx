import React, { FC } from 'react';
import Spin from 'antd/lib/spin';
import './Loading.less';

interface Prop {
    show: any;
}

/**
 * 小菊花组件
 */
const Loading: FC<Prop> = (props) => {

    return <div className="loading" style={{ display: props.show === 'true' ? 'block' : 'none' }}>
        <Spin {...props} />
    </div>
}

export default Loading;