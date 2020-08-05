import React, { FC, memo, useState } from 'react';
import { IpcRendererEvent } from 'electron';
import { useSubscribe } from '@src/hooks';
import { FetchRecord, ProgressType } from '@src/schema/socket/FetchRecord';
import NoWrapText from '../NoWrapText/NoWrapText';
import './FetchInfo.less';

const prev = new Map<number, FetchRecord>();

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

    /**
     * 接收进度消息
     * @param event 
     * @param arg 
     */
    const progressHandle = (event: IpcRendererEvent, arg: EventMessage) => {

        if (arg.usb === props.usb) {
            prev.set(arg.usb, arg.fetchRecord);
            setData(arg.fetchRecord);
        }
    }

    /**
     * 采集结束后监听消息，清除USB序号对应的缓存
     * @param usb 序号
     */
    const fetchOverHandle = (event: IpcRendererEvent, usb: number) => {
        prev.delete(usb);
    };

    const setColor = () => {

        let temp: FetchRecord | undefined;
        if (data) {
            temp = data;
        } else {
            temp = prev.get(props.usb);
        }

        switch (temp?.type) {
            case ProgressType.Normal:
                return <span className="info-default">{temp?.info}</span>;
            case ProgressType.Message:
                return <span className="info-primary">{temp?.info}</span>;
            case ProgressType.Warning:
                return <span className="info-danger">{temp?.info}</span>;
            default:
                return <span className="info-default">{temp?.info}</span>;
        }
    }

    useSubscribe('fetch-progress', progressHandle);
    useSubscribe('fetch-over', fetchOverHandle);

    return <NoWrapText width={290} align="center">{setColor()}</NoWrapText>;

};

export default memo(FetchInfo);