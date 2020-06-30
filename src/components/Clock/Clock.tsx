import { ipcRenderer, IpcRendererEvent } from 'electron';
import React, { FC, useState, useEffect, useRef, memo } from 'react';
import moment from 'moment';
import './Clock.less';
import localStore from '@utils/localStore';
import { helper } from '@utils/helper';

interface Prop {
    usb: number;
};

/**
 * 计时时钟
 */
const Clock: FC<Prop> = (props) => {

    const prevTimeString = useRef<string>();
    const [timeString, setTimeString] = useState<string>('00:00:00');

    const timeHandle = (event: IpcRendererEvent, usb: number, timeString: string) => {
        if (props.usb === usb) {
            setTimeString(timeString);
            prevTimeString.current = timeString;
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
