import React, { FC } from 'react';
import Nav from '../nav/Nav';
import AlarmMessage from '../AlarmMessage/AlarmMessage';
import '@src/styles/global.less';

interface Prop {}

/**
 * @description 布局组件
 * @param props
 */
const Layout: FC<Prop> = (props) => {
	return (
		<>
			<Nav />
			<div className="bottom-root">{props.children}</div>
			<AlarmMessage />
		</>
	);
};

export default Layout;
