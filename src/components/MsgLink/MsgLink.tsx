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
	const { show, flash, clickHandle, children } = props;
	return (
		<a
			className={classnames({ 'msg-link-root': true, flash: flash })}
			style={{ display: show ? 'inline-block' : 'none' }}
			onClick={() => clickHandle!(props)}>
			{children}
		</a>
	);
};

MsgLink.defaultProps = {
	show: false,
	flash: false,
	clickHandle: (arg0: DeviceType) => {}
};

export default MsgLink;
