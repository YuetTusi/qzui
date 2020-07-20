import React, { FC } from 'react';
import classnames from 'classnames';
import DeviceType from '@src/schema/socket/DeviceType';
import './MsgLink.less';

interface Prop extends DeviceType {
    /**
     * 是否显示
     */
    show: boolean;
    /**
     * 是否闪烁
     */
    flash?: boolean;
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
        className={classnames({ 'msg-link-root': true, 'flash': props.flash })}
        style={{ display: props.show ? 'inline-block' : 'none' }}
        onClick={() => props.clickHandle!(props)}
    >{props.children}</a>;
}

MsgLink.defaultProps = {
    show: false,
    flash: false,
    clickHandle: () => { }
};

export default MsgLink;