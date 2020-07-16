import React, { FC } from 'react';
import DeviceType from '@src/schema/socket/DeviceType';
import './MsgLink.less';

interface Prop extends DeviceType {
    /**
     * 是否显示
     */
    show: boolean;
    /**
     * 点击回调
     */
    clickHandle?: (arg0: DeviceType) => void;
}

/**
 * 消息A连接
 */
const MsgLink: FC<Prop> = (props) => {
    return <a
        className="msg-link-root"
        style={{ display: props.show ? 'inline-block' : 'none' }}
        onClick={() => props.clickHandle!(props)}
    >{props.children}</a>;
}

MsgLink.defaultProps = {
    show: false,
    clickHandle: () => { }
};

export default MsgLink;