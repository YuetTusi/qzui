import React, { FC, memo, useEffect, useState } from 'react';
import { ipcRenderer, IpcRendererEvent } from 'electron';
import NoWrapText from '../NoWrapText/NoWrapText';
import { FetchRecord } from '@src/schema/socket/FetchRecord';

interface Prop {
    /**
     * 设备序号
     */
    usb: number;
};

interface EventMessage {
    /**
     * 当前消息所属设备序号
     */
    usb: number;
    /**
     * 采集记录
     */
    fetchRecord: FetchRecord;
}

/**
 * 采集进度消息组件
 * @param props 
 */
const FetchInfo: FC<Prop> = (props) => {

    const [info, setInfo] = useState<string>('');

    const progressHandle = (event: IpcRendererEvent, arg: EventMessage) => {

        if (arg.usb === props.usb) {
            setInfo(arg.fetchRecord.info);
        }
    }

    useEffect(() => {
        ipcRenderer.on('fetch-progress', progressHandle);
        return () => {
            ipcRenderer.removeListener('fetch-progress', progressHandle);
        }
    }, []);

    return <NoWrapText width={290} align="center">{info}</NoWrapText>;

};

export default memo(FetchInfo);
