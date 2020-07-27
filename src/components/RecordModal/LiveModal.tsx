import React, { FC, useEffect, useState, useRef, memo } from 'react';
import { ipcRenderer, IpcRendererEvent } from 'electron';
import moment from 'moment';
import throttle from 'lodash/throttle';
import Button from 'antd/lib/button';
import Empty from 'antd/lib/empty';
import Modal from 'antd/lib/modal';
import { Prop, EventMessage } from './liveComponentType';
import { helper } from '@src/utils/helper';
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
    const stopScroll = useRef<boolean>(false);


    const mouseoverHandle = throttle((event: Event) => {
        stopScroll.current = true;
    }, 400, { leading: true });
    const mouseleaveHandle = (event: Event) => {
        stopScroll.current = false;
    };
    const progressHandle = (event: IpcRendererEvent, arg: EventMessage) => {

        //TODO: 用arg.usb序号来做分组，寄存数据，建议使用Map结构
        //TODO: 用户点开时使用当前USB序号过滤显示内容
        //TODO: 采集完成时，入库，并清空对应的USB序号数据
        console.log(props.usb);

        if (dataMap.get(arg.usb)) {
            dataMap.get(arg.usb)!.push(arg.fetchRecord);
        } else {
            dataMap.set(arg.usb, [arg.fetchRecord]);
        }
    }

    useEffect(() => {
        if (!stopScroll.current && scrollBox.current !== null) {
            const h = scrollBox.current.scrollHeight;
            scrollBox.current.scrollTo(0, h);
        }

        ipcRenderer.on('fetch-progress', progressHandle);
        return () => {
            ipcRenderer.removeListener('fetch-progress', progressHandle);
        }
    }, []);

    useEffect(() => {
        stopScroll.current = true;
        scrollBox.current?.addEventListener('mouseover', mouseoverHandle);
        scrollBox.current?.addEventListener('mouseleave', mouseleaveHandle);

        return () => {
            scrollBox.current?.removeEventListener('mouseover', mouseoverHandle);
            scrollBox.current?.removeEventListener('mouseleave', mouseleaveHandle);
        }
    });

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