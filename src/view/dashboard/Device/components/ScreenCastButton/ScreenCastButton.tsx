import debounce from 'lodash/debounce';
import React, { FC, MouseEvent } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTv } from '@fortawesome/free-solid-svg-icons';
import Button from 'antd/lib/button';
import DeviceType from '@src/schema/socket/DeviceType';
import PhoneSystem from '@src/schema/socket/PhoneSystem';
import { FetchState } from '@src/schema/socket/DeviceState';
import './ScreenCastButton.less';

/**
 * 投屏按钮
 */
const ScreenCastButton: FC<{
    data: DeviceType,
    clickHandle: (data: DeviceType) => void
}> = ({ data, clickHandle }) => {

    const isDisplay = (dev: DeviceType) => {

        if (dev.system === PhoneSystem.Android) {
            return dev.fetchState === FetchState.NotConnected || data.fetchState === FetchState.Waiting
                ? 'none'
                : 'flex';
        } else {
            return 'none';
        }
    };

    const onButtonClick = debounce((event: MouseEvent<HTMLElement>) => {
        event.preventDefault();
        clickHandle(data);
    }, 3000, { leading: true, trailing: false });

    return <div className="screen-cast-button-root"
        style={{
            display: isDisplay(data)
        }}>
        <Button
            onClick={onButtonClick}
            type="link"
            size="small">
            <FontAwesomeIcon icon={faTv} />
            <span>投屏</span>
        </Button>
    </div>;
};

export { ScreenCastButton };