import React, { FC, useEffect, useState, useRef, memo } from 'react';
import { ipcRenderer, IpcRendererEvent } from 'electron';
import moment from 'moment';
// import throttle from 'lodash/throttle';
import Button from 'antd/lib/button';
import Empty from 'antd/lib/empty';
import Modal from 'antd/lib/modal';
import message from 'antd/lib/message';
import { Prop, EventMessage } from './liveComponentType';
import Db from '@src/utils/db';
import logger from '@src/utils/log';
import { helper } from '@src/utils/helper';
import { TableName } from '@src/schema/db/TableName';
import FetchLog from '@src/schema/socket/FetchLog';
import FetchRecord, { ProgressType } from '@src/schema/socket/FetchRecord';
import './RecordModal.less';

const dataMap = new Map<number, FetchRecord[]>();//按USB序号存储采集记录

/**
 * 采集记录框（此框用于采集时实显示进度消息）
 */
const LiveModal: FC<Prop> = props => {

    const { title, visible, cancelHandle } = props;
    const [data, setData] = useState<FetchRecord[]>([]);
    const scrollBox = useRef<HTMLDivElement>(null);
    // const stopScroll = useRef<boolean>(false);


    // const mouseoverHandle = throttle((event: Event) => {
    //     stopScroll.current = true;
    // }, 400, { leading: true });
    // const mouseleaveHandle = (event: Event) => {
    //     stopScroll.current = false;
    // };
    const progressHandle = (event: IpcRendererEvent, arg: EventMessage) => {

        //TODO: 用arg.usb序号来做分组，寄存数据，建议使用Map结构
        //TODO: 用户点开时使用当前USB序号过滤显示内容
        //TODO: 采集完成时，入库，并清空对应的USB序号数据

        if (dataMap.has(arg.usb)) {
            dataMap.get(arg.usb)!.push(arg.fetchRecord);
        } else {
            dataMap.set(arg.usb, [arg.fetchRecord]);
        }
    };

    /**
     * 采集完成将记录入库
     * @param event 
     * @param usb 完成设备的USB序号 
     * @param log 日志对象
     */
    const finishHandle = async (event: IpcRendererEvent, usb: number, log: FetchLog) => {

        const db = new Db<FetchLog>(TableName.FetchLog);
        try {
            if (dataMap.has(usb)) {
                //将记录数据赋值到日志对象中
                log.record = dataMap.get(usb)!.filter(item => item.type !== ProgressType.Normal);
            } else {
                log.record = [];
            }
            await db.insert(log);

        } catch (error) {
            message.error('存储采集日志失败');
            logger.error({ message: `存储采集日志失败 @component/RecordModal/LiveModal/finishHandle: ${error.message}` });
        }
    };

    /**
     * 清除USB序号对应的Map数据
     * @param event 
     * @param usb 序号
     */
    const clearHandle = (event: IpcRendererEvent, usb: number) => {
        dataMap.delete(usb);
    };

    useEffect(() => {
        // if (!stopScroll.current && scrollBox.current !== null) {
        //     const h = scrollBox.current.scrollHeight;
        //     scrollBox.current.scrollTo(0, h);
        // }

        ipcRenderer.on('fetch-progress', progressHandle);
        ipcRenderer.on('fetch-finish', finishHandle);
        ipcRenderer.on('progress-clear', clearHandle);
        return () => {
            ipcRenderer.removeListener('fetch-progress', progressHandle);
            ipcRenderer.removeListener('fetch-finish', finishHandle);
            ipcRenderer.removeListener('progress-clear', clearHandle);
        }
    }, []);

    // useEffect(() => {
    //     stopScroll.current = true;
    //     scrollBox.current?.addEventListener('mouseover', mouseoverHandle);
    //     scrollBox.current?.addEventListener('mouseleave', mouseleaveHandle);

    //     return () => {
    //         scrollBox.current?.removeEventListener('mouseover', mouseoverHandle);
    //         scrollBox.current?.removeEventListener('mouseleave', mouseleaveHandle);
    //     }
    // });

    useEffect(() => {
        if (props.usb && dataMap.has(props.usb)) {
            setData(dataMap.get(props.usb)!);
        } else {
            setData([]);
        }
    }, [props.visible]);

    /**
     * 渲染时间
     * @param time 时间对象
     */
    const renderTime = (time: Date) => {
        if (helper.isNullOrUndefined(time)) {
            return '- - -';
        } else {
            return moment(time).format('YYYY-MM-DD HH:mm:ss');
        }
    };

    /**
     * 渲染记录数据
     */
    const renderData = () => {

        if (data.length === 0) {
            return <div className="middle">
                <Empty description="暂无记录" image={Empty.PRESENTED_IMAGE_SIMPLE} />
            </div>;
        } else {
            return <ul>
                {
                    data.map(item => {
                        switch (item.type) {
                            case ProgressType.Normal:
                                return <li key={helper.getKey()}>
                                    <label>【{renderTime(item.time)}】</label>
                                    <span style={{ color: '#222' }}>{item.info}</span>
                                </li>;
                            case ProgressType.Warning:
                                return <li key={helper.getKey()}>
                                    <label>【{renderTime(item.time)}】</label>
                                    <span style={{ color: '#dc143c' }}>{item.info}</span>
                                </li>;
                            case ProgressType.Message:
                                return <li key={helper.getKey()}>
                                    <label>【{renderTime(item.time)}】</label>
                                    <span style={{ color: '#416eb5' }}>{item.info}</span>
                                </li>;
                            default:
                                return <li key={helper.getKey()}>
                                    <label>【{renderTime(item.time)}】</label>
                                    <span style={{ color: '#222' }}>{item.info}</span>
                                </li>;
                        }
                    })
                }
            </ul>;
        }
    }

    return <Modal
        visible={visible}
        footer={[
            <Button type="default" icon="close-circle" onClick={props.cancelHandle}>取消</Button>
        ]}
        onCancel={cancelHandle}
        title={title}
        width={800}
        maskClosable={false}
        className="record-modal-root">
        <div className="list-block" ref={scrollBox}>
            {renderData()}
        </div>
    </Modal>;
};

LiveModal.defaultProps = {
    visible: false,
    title: '采集记录',
    cancelHandle: () => { }
};

// export default memo(LiveModal, (prev: Prop, next: Prop) => {
//     return !prev.visible && !next.visible;
// });

export default memo(LiveModal);