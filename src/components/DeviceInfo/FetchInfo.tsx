import React, { FC, memo, useEffect, useState } from 'react';
import { ipcRenderer, IpcRendererEvent } from 'electron';
import { FetchRecord, ProgressType } from '@src/schema/socket/FetchRecord';
import NoWrapText from '../NoWrapText/NoWrapText';

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

    const [data, setData] = useState<FetchRecord>();

    const progressHandle = (event: IpcRendererEvent, arg: EventMessage) => {

        if (arg.usb === props.usb) {
            setData(arg.fetchRecord);
        }
    }

    const setColor = () => {
        switch (data?.type) {
            case ProgressType.Normal:
                return <span style={{ color: '#222' }}>{data?.info}</span>;
            case ProgressType.Message:
                return <span style={{ color: '#416eb5' }}>{data?.info}</span>;
            case ProgressType.Warning:
                return <span style={{ color: '#dc143c' }}>{data?.info}</span>;
            default:
                return <span style={{ color: '#222' }}>{data?.info}</span>;
        }
    }

    useEffect(() => {
        ipcRenderer.on('fetch-progress', progressHandle);
        return () => {
            ipcRenderer.removeListener('fetch-progress', progressHandle);
        }
    }, []);

    return <NoWrapText width={290} align="center">{setColor()}</NoWrapText>;

};

export default memo(FetchInfo);
