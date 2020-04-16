import React, { FC } from 'react';
import './MsgLink.less';

interface Prop {
    /**
     * 是否显示
     */
    isShow: boolean;
    /**
     * 点击回调
     */
    clickHandle?: () => void;
}

/**
 * 消息A连接
 */
const MsgLink: FC<Prop> = (props) => {
    return <a
        className="msg-link-root"
        style={{ display: props.isShow ? 'block' : 'none' }}
        onClick={props.clickHandle}
    >{props.children}</a>;
}

export default MsgLink;