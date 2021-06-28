import React, { FC } from 'react';
import { helper } from '@src/utils/helper';
import { Prop } from './ComponentType';
import { FetchState } from '@src/schema/socket/DeviceState';
import {
	getDomByWaiting,
	getDomByNotConnect,
	getDomByHasConnect,
	getDomByFetching,
	getDomByFetchEnd,
	getDomByHasError
} from './renderByState';
import './DeviceInfo.less';
import './DeviceInfo4Pad.less';

const { max } = helper.readConf();

/**
 * 设备组件
 */
const DeviceInfo: FC<Prop> = (props) => {
	/**
	 * 根据设备状态渲染
	 * @param {FetchState} state 采集状态（枚举值）
	 */
	const renderByState = (state: FetchState) => {
		switch (state) {
			case FetchState.Waiting:
				return getDomByWaiting(props);
			case FetchState.NotConnected:
				return getDomByNotConnect(props);
			case FetchState.Connected:
				return getDomByHasConnect(props);
			case FetchState.Fetching:
				return getDomByFetching(props);
			case FetchState.Finished:
				return getDomByFetchEnd(props);
			case FetchState.HasError:
				return getDomByHasError(props);
			default:
				return getDomByWaiting(props);
		}
	};

	return (
		<div className={max <= 2 ? 'widget-phone-info-pad' : 'widget-phone-info'}>
			{renderByState(props.fetchState!)}
		</div>
	);
};

export default DeviceInfo;
