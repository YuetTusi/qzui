import React, { FC, memo } from 'react';
import { helper } from '@src/utils/helper';
import { Prop } from './ComponentType';
import { FetchState } from '@src/schema/socket/DeviceState';
import {
    getDomByWaiting, getDomByNotConnect, getDomByHasConnect,
    getDomByFetching, getDomByFetchEnd
} from './renderByState';
import './DeviceInfo.less';
import './DeviceInfo4Pad.less';

const deviceCount: number = helper.readConf().max;


const DeviceInfo: FC<Prop> = (props) => {

    /**
     * 根据连接状态渲染组件
     * @param {ConnectState} status 组件状态（枚举值）
     */
    const renderByStatus = (state: FetchState): JSX.Element => {
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
            default:
                return getDomByWaiting(props);
        }
    }

    return <div className={deviceCount <= 2 ? 'widget-phone-info-pad' : 'widget-phone-info'}>
        {renderByStatus(props.fetchState!)}
    </div>;
};

export default memo(DeviceInfo);
