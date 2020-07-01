import { ipcRenderer, IpcRendererEvent } from 'electron';
import React, { FC, useState, useEffect, useRef, memo } from 'react';
import moment from 'moment';
import './Clock.less';
import localStore from '@utils/localStore';
import { helper } from '@utils/helper';

interface Prop {
    usb: number;
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

    return <div className="clock-color">{timeString}</div>;
};

export default memo(Clock);
