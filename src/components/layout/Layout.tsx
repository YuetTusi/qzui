import { Dispatch } from 'redux';
import React, { FC } from 'react';
import { connect } from 'dva';
import { routerRedux } from 'dva/router';
import Nav from '../nav/Nav';
import AlarmMessage from '../AlarmMessage';
import '@src/styles/global.less';
import { useSubscribe } from '@src/hooks';
import { helper } from '@src/utils/helper';

const { useLogin } = helper.readConf()!;

/**
 * @description 布局组件
 */
const Layout: FC<{ dispatch: Dispatch<any> }> = ({ dispatch, children }) => {

	useSubscribe('overtime', () => {
		//订阅空闲超时事件，若用户长时无操作则踢出登录页
		if (useLogin) {
			dispatch(routerRedux.push('/login?msg=因长时间未使用，用户已登出'));
		}
	});

	return <>
		<Nav />
		<div className="bottom-root">{children}</div>
		<AlarmMessage />
	</>;
}

export default connect()(Layout);
