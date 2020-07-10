import { ipcRenderer, IpcRendererEvent } from 'electron';
import classnames from 'classnames';
import React, { FC, useState, useEffect, memo } from 'react';
import { helper } from '@utils/helper';
import './Clock.less';

interface Prop {
    /**
     * USB序号（从0开始）
     */
    usb: number;
    /**
     * 操作系统
     */
    system: string;
};


const prevTimeStringMap = new Map<number, string>();
const deviceCount = helper.readConf().max;

for (let i = 0; i < deviceCount; i++) {
    prevTimeStringMap.set(i, '00:00:00');
}

/**
 * 计时时钟
 * 时钟的序号从0开始，传入的USB序号需做-1操作
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
