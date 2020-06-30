import React, { FC } from 'react';
import { Prop } from './ComponentType';
import './DeviceInfo.less';
import { DeviceState } from '@src/schema/socket/DeviceState';
import { getDomByWaiting, getDomByNotConnect, getDomByHasConnect, getDomByFetching, getDomByFetchEnd } from './renderByState';
import { helper } from '@src/utils/helper';

const DEVICE_COUNT: number = helper.readConf().max;


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

    return <div className={DEVICE_COUNT <= 2 ? 'widget-phone-info-pad' : 'widget-phone-info'}>
        {renderByStatus(props.state!)}
    </div>;
};

export default DeviceInfo;
