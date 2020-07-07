import { ipcRenderer, IpcRendererEvent } from 'electron';
import classnames from 'classnames';
import React, { FC, useState, useEffect, memo } from 'react';
import { helper } from '@utils/helper';
import './Clock.less';

interface Prop {
    usb: number;
    system: string;
};


const prevTimeStringMap = new Map<number, string>();
const deviceCount = helper.readConf().max;

for (let i = 0; i < deviceCount; i++) {
    prevTimeStringMap.set(i, '00:00:00');
}

/**
 * 计时时钟
 */
const Clock: FC<Prop> = (props) => {

    const [timeString, setTimeString] = useState<string>(prevTimeStringMap.get(props.usb)!);

    const timeHandle = (event: IpcRendererEvent, usb: number, timeString: string) => {
        if (props.usb === usb) {
            setTimeString(timeString);
            prevTimeStringMap.set(props.usb, timeString);
        }
    };


    useEffect(() => {
        ipcRenderer.on('receive-time', timeHandle);
        return () => {
            ipcRenderer.removeListener('receive-time', timeHandle);
        }
    }, []);

    return <div className={classnames({
        'clock-color': true,
        'pad': deviceCount <= 2,
        'green': props.system === 'android'
    })}>{timeString}</div>;
};

Clock.defaultProps = {
    usb: 0,
    system: 'android'
};

export default memo(Clock);
