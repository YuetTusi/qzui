import React, { FC } from 'react';
import Nav from '../nav/Nav';
import AlarmMessage from '../AlarmMessage';
import '@src/styles/global.less';

/**
 * @description 布局组件
 */
const Layout: FC<{}> = ({ children }) => (
	<>
		<Nav />
		<div className="bottom-root">{children}</div>
		<AlarmMessage />
	</>
);

export default Layout;
