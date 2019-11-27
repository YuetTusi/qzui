import React, { ReactElement, PropsWithChildren } from 'react';
import { AppDataExtractType } from '@src/schema/AppDataExtractType';
import './MsgLink.less';

interface IProp {
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
function MsgLink(props: PropsWithChildren<IProp>): ReactElement {
    return <a
        className="msg-link-root"
        style={{ display: props.isShow ? 'block' : 'none' }}
        onClick={props.clickHandle}
    >{props.children}</a>;
}

export default MsgLink;