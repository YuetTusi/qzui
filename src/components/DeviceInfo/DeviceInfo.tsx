import React, { FC, memo } from 'react';
import { helper } from '@src/utils/helper';
import { Prop } from './ComponentType';
import { DeviceState } from '@src/schema/socket/DeviceState';
import {
    getDomByWaiting, getDomByNotConnect, getDomByHasConnect,
    getDomByFetching, getDomByFetchEnd
} from './renderByState';
import './DeviceInfo.less';

const deviceCount: number = helper.readConf().max;


const DeviceInfo: FC<Prop> = (props) => {


    /**
     * 根据连接状态渲染组件
     * @param {ConnectState} status 组件状态（枚举值）
     */
    const renderByStatus = (state: DeviceState): JSX.Element => {
        switch (state) {
            case DeviceState.Waiting:
                return getDomByWaiting(props);
            case DeviceState.NotConnected:
                return getDomByNotConnect(props);
            case DeviceState.Connected:
                return getDomByHasConnect(props);
            case DeviceState.Fetching:
                return getDomByFetching(props);
            case DeviceState.Finished:
                return getDomByFetchEnd(props);
            default:
                return getDomByWaiting(props);
        }
    }

    return <div className={deviceCount <= 2 ? 'widget-phone-info-pad' : 'widget-phone-info'}>
        {renderByStatus(props.state!)}
    </div>;
};

export default memo(DeviceInfo);
